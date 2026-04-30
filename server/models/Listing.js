const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: 5,
			maxlength: 120,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			minlength: 20,
			maxlength: 2000,
		},
		location: {
			city: { type: String, required: true, trim: true },
			country: { type: String, required: true, trim: true },
			address: { type: String, trim: true },
		},
		pricePerNight: {
			type: Number,
			required: true,
			min: 0,
		},
		propertyType: {
			type: String,
			trim: true,
			default: '',
		},
		maxGuests: {
			type: Number,
			required: true,
			min: 1,
			max: 50,
		},
		amenities: {
			type: [String],
			default: [],
		},
		images: {
			type: [String],
			default: [],
		},
		host: {
			type: String,
			ref: 'User',
			required: true,
			index: true,
		},
		averageRating: {
			type: Number,
			default: 0,
			min: 0,
			max: 5,
		},
		reviewCount: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{
		timestamps: true,
	},
);

listingSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'listing',
});

module.exports = mongoose.model('Listing', listingSchema);
