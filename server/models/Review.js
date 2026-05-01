const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		listing: {
			type: String,
			ref: 'Listing',
			required: true,
			index: true,
		},
		author: {
			type: String,
			ref: 'User',
			required: true,
			index: true,
		},
		reviewerName: {
			type: String,
			trim: true,
		},
		comments: {
			type: String,
			required: true,
			trim: true,
			default: '',
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
			default: 0,
		},
		photoPath: {
			type: String,
		},
		date: {
			type: Date,
			default: Date.now,
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Enforces the uniqueness of review
reviewSchema.index({ listing: 1, author: 1 }, { unique: true});

module.exports = mongoose.model('Review', reviewSchema);
