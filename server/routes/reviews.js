// routes/reviews.js
const express = require('express');
const router = express.Router();

const Review = require('../models/Review');
const Listing = require('../models/Listing');

const auth = require('../middleware/auth');
const reviewOwner = require('../middleware/reviewOwner');

// CREATE REVIEW
router.post('/', auth, async (req, res) => {
  try {
    const { listingId, rating, comments } = req.body;

    if (!listingId || !rating || !comments) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Ensure listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Create review
    const review = await Review.create({
      listing: listingId,
      author: req.user._id,
      reviewerName: `${req.user.firstName} ${req.user.lastName}`,
      rating,
      comments,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already reviewed this listing' });
    }
    res.status(500).json({ message: err.message });
  }
});

// UPDATE REVIEW
router.put('/:id', auth, reviewOwner, async (req, res) => {
  try {
    const { rating, comments } = req.body;

    req.review.rating = rating ?? req.review.rating;
    req.review.comments = comments ?? req.review.comments;

    await req.review.save();

    res.json(req.review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE REVIEW
router.delete('/:id', auth, reviewOwner, async (req, res) => {
  try {
    await req.review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
