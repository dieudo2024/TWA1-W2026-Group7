require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');

const DATA_FILE = process.env.IMPORT_FILE || path.join(__dirname, '..', 'data', 'airbnb.listingAndReviews.json');
const SHOULD_CLEAR = String(process.env.IMPORT_CLEAR || 'true').toLowerCase() === 'true';

function convertExtendedJson(value) {
  if (Array.isArray(value)) {
    return value.map(convertExtendedJson);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Object.keys(value).length === 1 && value.$numberDecimal !== undefined) {
    return mongoose.Types.Decimal128.fromString(String(value.$numberDecimal));
  }

  if (Object.keys(value).length === 1 && value.$date !== undefined) {
    return new Date(value.$date);
  }

  const output = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    output[key] = convertExtendedJson(nestedValue);
  }

  return output;
}

function buildUserDocs(listings) {
  const usersById = new Map();

  for (const listing of listings) {
    const host = listing.host || {};
    if (!host.host_id) {
      continue;
    }

    usersById.set(String(host.host_id), {
      _id: String(host.host_id),
      ...host,
    });
  }

  return [...usersById.values()];
}

function buildReviewDocs(listings) {
  const reviewDocs = [];

  for (const listing of listings) {
    const listingId = String(listing._id);
    if (!Array.isArray(listing.reviews)) {
      continue;
    }

    for (const review of listing.reviews) {
      if (!review.reviewer_id || !review.reviewer_name || !review.date) {
        continue;
      }

      reviewDocs.push({
        listing_id: listingId,
        reviewer_id: String(review.reviewer_id),
        reviewer_name: String(review.reviewer_name),
        date: new Date(review.date),
        comments: review.comments ? String(review.comments) : '',
      });
    }
  }

  return reviewDocs;
}

async function runImport() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to server/.env');
  }

  console.log('Import file:', DATA_FILE);
  console.log('Clear collections first:', SHOULD_CLEAR);

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Dataset must be a JSON array of listing documents.');
  }

  const listings = parsed.map(convertExtendedJson);
  const users = buildUserDocs(listings);
  const reviews = buildReviewDocs(listings);

  await mongoose.connect(process.env.MONGO_URI);

  if (SHOULD_CLEAR) {
    await Promise.all([
      Listing.deleteMany({}),
      User.deleteMany({}),
      Review.deleteMany({}),
    ]);
  }

  if (listings.length > 0) {
    await Listing.insertMany(listings, { ordered: false });
  }

  if (users.length > 0) {
    await User.bulkWrite(
      users.map((user) => ({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: user },
          upsert: true,
        },
      })),
      { ordered: false },
    );
  }

  if (reviews.length > 0) {
    await Review.insertMany(reviews, { ordered: false });
  }

  const [listingCount, userCount, reviewCount] = await Promise.all([
    Listing.countDocuments(),
    User.countDocuments(),
    Review.countDocuments(),
  ]);

  console.log('Import complete');
  console.log('Listings:', listingCount);
  console.log('Users:', userCount);
  console.log('Reviews:', reviewCount);

  await mongoose.disconnect();
}

runImport().catch(async (error) => {
  console.error('Import failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    // ignore disconnect errors during failure shutdown
  }
  process.exit(1);
});
