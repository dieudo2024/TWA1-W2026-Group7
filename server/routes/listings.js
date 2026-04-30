const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Review = require('../models/Review');

// GET /api/listings - Get all listings (Paginated + Filtered)
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice, page = 1 } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (city) query['location.city'] = new RegExp(city, 'i');

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // ❌ Removed propertyType filter — it does not exist in your schema

    const listings = await Listing.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching listings", error: err.message });
  }
});

// GET /api/listings/:id/reviews - Get reviews only
router.get('/:id/reviews', async (req, res) => {
  try {
    const listingId = req.params.id;

    // Reviews created by real users (author = ObjectId)
    const userReviews = await Review.find({
      listing: listingId,
      author: { $type: 'objectId' }
    })
      .populate('author', 'firstName lastName')
      .sort({ date: -1 });

    // Imported Airbnb reviews (author = string)
    const importedReviews = await Review.find({
      listing: listingId,
      author: { $type: 'string' }
    })
      .select('rating comments reviewerName date')
      .sort({ date: -1 });

    res.json([...userReviews, ...importedReviews]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching listing reviews", error: err.message });
  }
});

// GET /api/listings/:id - Get listing + ALL reviews
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    const listingId = req.params.id;

    // Reviews created by real users
    const userReviews = await Review.find({
      listing: listingId,
      author: { $type: 'objectId' }
    })
      .populate('author', 'firstName lastName')
      .sort({ date: -1 });

    // Imported Airbnb reviews
    const importedReviews = await Review.find({
      listing: listingId,
      author: { $type: 'string' }
    })
      .select('rating comments reviewerName date')
      .sort({ date: -1 });

    res.json({
      ...listing.toObject(),
      reviews: [...userReviews, ...importedReviews]
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching listing detail", error: err.message });
  }
});

module.exports = router;
