const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 60,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false,
		},
		avatarUrl: {
			type: String,
			trim: true,
		},
		role: {
			type: String,
			enum: ['guest', 'host', 'admin'],
			default: 'guest',
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

userSchema.virtual('listings', {
	ref: 'Listing',
	localField: '_id',
	foreignField: 'host',
});

userSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id',
	foreignField: 'author',
});

module.exports = mongoose.model('User', userSchema);
