require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');

const DEFAULT_DATA_FILE = path.join(__dirname, '..', 'data', 'airbnb.listingAndReviews.json');

function toNumber(value, fallback = 0) {
  if (value == null) {
    return fallback;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'object' && typeof value.toString === 'function') {
    const parsed = Number(value.toString());
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getAddressField(address, fieldName) {
  return address && typeof address === 'object' ? address[fieldName] : undefined;
}

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

function buildListingDocs(listings) {
  return listings.map((listing) => {
    const address = listing.address || {};
    const imageUrl = listing.images && listing.images.picture_url ? String(listing.images.picture_url) : '';
    const hostId = listing.host && listing.host.host_id ? String(listing.host.host_id) : String(listing._id);

    return {
      _id: String(listing._id),
      title: listing.name ? String(listing.name) : 'Untitled listing',
      description: listing.description || listing.summary || listing.space || '',
      location: {
        city: String(getAddressField(address, 'market') || getAddressField(address, 'suburb') || getAddressField(address, 'street') || 'Unknown'),
        country: String(getAddressField(address, 'country') || 'Unknown'),
        address: getAddressField(address, 'street') ? String(getAddressField(address, 'street')) : '',
      },
      pricePerNight: toNumber(listing.price),
      maxGuests: Math.max(1, toNumber(listing.accommodates, 1)),
      amenities: Array.isArray(listing.amenities) ? listing.amenities.map((amenity) => String(amenity)) : [],
      images: imageUrl ? [imageUrl] : [],
      host: hostId,
      averageRating: toNumber(listing.review_scores_rating) > 0 ? toNumber(listing.review_scores_rating) / 20 : 0,
      reviewCount: toNumber(listing.number_of_reviews),
    };
  });
}

function buildUserDocs(listings) {
  const usersById = new Map();

  function normalizeNamePart(value, fallback) {
    const trimmed = String(value || '').trim();
    if (trimmed.length >= 2) {
      return trimmed;
    }

    return fallback;
  }

  function splitHostName(fullName, hostId) {
    const trimmed = String(fullName || '').trim();

    if (!trimmed) {
      return {
        firstName: 'Host',
        lastName: normalizeNamePart(hostId, 'User'),
      };
    }

    const parts = trimmed.split(/\s+/);
    const firstName = normalizeNamePart(parts[0], 'Host');
    const lastNameSource = parts.length > 1 ? parts.slice(1).join(' ') : `Host ${hostId}`;
    const lastName = normalizeNamePart(lastNameSource, 'User');

    return { firstName, lastName };
  }

  for (const listing of listings) {
    const host = listing.host || {};
    if (!host.host_id) {
      continue;
    }

    const hostId = String(host.host_id);
    const email = String(host.email || `host-${hostId}@airbnb.local`).toLowerCase();
    const rawPassword = String(host.password || `imported-${hostId}`);
    const { firstName, lastName } = splitHostName(host.host_name || host.name, hostId);

    usersById.set(String(host.host_id), {
      firstName,
      lastName,
      email,
      passwordHash: bcrypt.hashSync(rawPassword, 10),
      avatarUrl: host.host_picture_url ? String(host.host_picture_url) : '',
      role: 'host',
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
      const reviewerId = review.reviewer_id || review.author_id;
      if (!reviewerId || !review.date) {
        continue;
      }

      reviewDocs.push({
        listing: listingId,
        author: String(reviewerId),
        reviewerName: review.reviewer_name ? String(review.reviewer_name) : '',
        date: new Date(review.date),
        comments: review.comments ? String(review.comments) : String(review.comment || ''),
        rating: review.rating != null ? toNumber(review.rating) : undefined,
      });
    }
  }

  return reviewDocs;
}

async function importData(options = {}) {
  const dataFile = options.dataFile || process.env.IMPORT_FILE || DEFAULT_DATA_FILE;
  const shouldClear = options.shouldClear !== undefined
    ? options.shouldClear
    : String(process.env.IMPORT_CLEAR || 'true').toLowerCase() === 'true';

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to server/.env');
  }

  const raw = fs.readFileSync(dataFile, 'utf-8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('Dataset must be a JSON array of listing documents.');
  }

  const listings = parsed.map(convertExtendedJson);
  const listingDocs = buildListingDocs(listings);
  const users = buildUserDocs(listings);
  const reviews = buildReviewDocs(listings);

  await mongoose.connect(process.env.MONGO_URI);

  try {
    if (shouldClear) {
      await Promise.all([
        Listing.deleteMany({}),
        User.deleteMany({}),
        Review.deleteMany({}),
      ]);
    }

    if (listingDocs.length > 0) {
      await Listing.insertMany(listingDocs, { ordered: false });
    }

    if (users.length > 0) {
      await User.bulkWrite(
        users.map((user) => ({
          updateOne: {
            filter: { email: user.email },
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

    return {
      listingCount,
      userCount,
      reviewCount,
      dataFile,
      shouldClear,
    };
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = {
  importData,
  convertExtendedJson,
  buildListingDocs,
  buildUserDocs,
  buildReviewDocs,
};

if (require.main === module) {
  importData()
    .then((result) => {
      console.log('Import complete');
      console.log('File:', result.dataFile);
      console.log('Clear collections first:', result.shouldClear);
      console.log('Listings:', result.listingCount);
      console.log('Users:', result.userCount);
      console.log('Reviews:', result.reviewCount);
    })
    .catch((error) => {
      console.error('Import failed:', error.message);
      process.exit(1);
    });
}