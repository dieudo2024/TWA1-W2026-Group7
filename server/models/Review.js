const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
		},
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
			trim: true,
			default: '',
		},
		rating: {
			type: Number,
			min: 0,
			max: 5,
			default: 0,
		},
		date: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

module.exports = mongoose.model('Review', reviewSchema);
