const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        listing_id: {
            type: String,
            required: true,
            index: true,
        },
        reviewer_id: {
            type: String,
            required: true,
            index: true,
        },
        reviewer_name: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
        },
        comments: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: false,
        versionKey: false,
        strict: false,
    },
);

reviewSchema.index({ listing_id: 1, reviewer_id: 1, date: 1 });

module.exports = mongoose.model('Review', reviewSchema);