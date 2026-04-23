require('dotenv').config();
const mongoose = require('mongoose');

const Listing = require('../models/Listing');
const User = require('../models/User');
const Review = require('../models/Review');

async function runVerify() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add it to server/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [listingCount, userCount, reviewCount] = await Promise.all([
    Listing.countDocuments(),
    User.countDocuments(),
    Review.countDocuments(),
  ]);

  console.log('=== Collection Counts ===');
  console.log('Listings:', listingCount);
  console.log('Users:', userCount);
  console.log('Reviews:', reviewCount);

  const [listingSample, userSample, reviewSample] = await Promise.all([
    Listing.findOne({}, { _id: 1, name: 1, 'host.host_id': 1, price: 1, address: 1 }).lean(),
    User.findOne({}, { _id: 1, host_name: 1, host_location: 1 }).lean(),
    Review.findOne({}, { _id: 1, listing_id: 1, reviewer_id: 1, reviewer_name: 1, date: 1 }).lean(),
  ]);

  console.log('\n=== Sample Documents ===');
  console.log('Listing sample:', listingSample || 'No listing documents found');
  console.log('User sample:', userSample || 'No user documents found');
  console.log('Review sample:', reviewSample || 'No review documents found');

  await mongoose.disconnect();
}

runVerify().catch(async (error) => {
  console.error('Verify failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    // ignore disconnect errors during failure shutdown
  }
  process.exit(1);
});
