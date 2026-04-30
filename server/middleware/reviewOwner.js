const Review = require('../models/Review');

module.exports = async function (req, res, next) {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to modify this review' });
    }

    req.review = review; // pass review to next middleware/controller
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
