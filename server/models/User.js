const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 60,
		},
		lastName: {
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
		passwordHash: {
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
		// toJSON: { virtuals: true },
		// toObject: { virtuals: true },
	},
);

// userSchema.virtual('listings', {
// 	ref: 'Listing',
// 	localField: '_id',
// 	foreignField: 'host',
// });

// userSchema.virtual('reviews', {
// 	ref: 'Review',
// 	localField: '_id',
// 	foreignField: 'author',
// });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
