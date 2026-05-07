require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/users');
const listingsRoutes = require('./routes/listings');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Create the correct directory path
const publicUploadsDir = path.join(__dirname, 'public', 'uploads');

// 2. Ensure the folder exists
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(publicUploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/reviews', require('./routes/reviews'));

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('MongoDB startup error:', err.message);
  }
}

connectMongo();