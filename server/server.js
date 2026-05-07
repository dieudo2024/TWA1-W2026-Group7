require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/users');
const listingsRoutes = require('./routes/listings');
const Listing = require('./models/Listing');
const { importData } = require('./utils/importData');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the public uploads directory exists
const publicUploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Serving the uploads folder so the frontend can see the images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/reviews', require('./routes/reviews'));

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    // Start server after DB connection
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('MongoDB startup error:', err.message);
  }
}

connectMongo();