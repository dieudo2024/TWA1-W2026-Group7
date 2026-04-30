require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const listingsRoutes = require('./routes/listings');
const Listing = require('./models/Listing');
const { importData } = require('./utils/importData');

const app = express();
const PORT = process.env.PORT || 3000;

async function seedDatabaseIfEmpty() {
  const shouldSeedOnStart = String(process.env.SEED_ON_START || 'true').toLowerCase() === 'true';

  if (!shouldSeedOnStart) {
    return;
  }

  const listingCount = await Listing.estimatedDocumentCount();
  if (listingCount > 0) {
    return;
  }

  console.log('No listings found. Importing dataset...');

  const result = await importData({
    shouldClear: false,
    manageConnection: false,
  });

  console.log(`Seed complete. Listings: ${result.listingCount}, Users: ${result.userCount}, Reviews: ${result.reviewCount}`);
}

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('MongoDB startup error:', err.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);

// Example protected route
app.get('/api/protected', require('./middleware/auth'), (req, res) => {
res.json({ message: 'This is a protected route', user: req.user });
});

// Basic route
app.get('/', (req, res) => {
  res.send('Airbnb Server is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

connectMongo();