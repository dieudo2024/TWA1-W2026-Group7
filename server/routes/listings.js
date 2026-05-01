const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const Review = require('../models/Review');

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/listings - Get all listings (Paginated + Filtered)
router.get('/', async (req, res) => {
    try {
        const { city, minPrice, maxPrice, type, page = 1 } = req.query;
        const limit = 10; // Limits results to 10 per page
        const skip = (page - 1) * limit;

        // Build search filters
        let query = {};
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (minPrice || maxPrice) {
            query.pricePerNight = {};
            if (minPrice) query.pricePerNight.$gte = Number(minPrice);
            if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
        }
        if (type) {
            const typeRegex = new RegExp(`^${escapeRegExp(type)}$`, 'i');
            query.$or = [
                { roomType: typeRegex },
                { propertyType: typeRegex },
            ];
        }

        const listings = await Listing.find(query)
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: "Error fetching listings", error: err.message });
    }
});

// GET /api/listings/room-types - Get distinct room types for filters
router.get('/room-types', async (req, res) => {
    try {
        const [roomTypes, propertyTypes] = await Promise.all([
            Listing.distinct('roomType'),
            Listing.distinct('propertyType'),
        ]);

        const cleaned = [...roomTypes, ...propertyTypes]
            .map((type) => String(type || '').trim())
            .filter(Boolean)
            .filter((value, index, array) => array.indexOf(value) === index)
            .sort((a, b) => a.localeCompare(b));

        res.json(cleaned);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching room types', error: err.message });
    }
});

// GET /api/listings/:id - Get detail for one specific listing[cite: 1]
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });
        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: "Error fetching listing detail", error: err.message });
    }
});

// GET /api/listings/:id/reviews - Get all reviews for a specific listing
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ listing: req.params.id })
            .sort({ date: -1 }); // Show newest first

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Error fetching reviews", error: err.message });
    }
});

module.exports = router;