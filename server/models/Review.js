const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		listing: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Listing',
			required: true,
			index: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
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
			min: 0,
			max: 5,
			default: 0,
		},
		potoPath: {
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

module.exports = mongoose.model('Review', reviewSchema);
