const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/users/me — returns profile info
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load current user' });
  }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const { firstName, lastName } = req.body || {};

    const update = {};
    if (typeof firstName !== 'undefined') {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        return res.status(400).json({ message: 'firstName must be a non-empty string' });
      }
      update.firstName = firstName.trim();
    }

    if (typeof lastName !== 'undefined') {
      if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        return res.status(400).json({ message: 'lastName must be a non-empty string' });
      }
      update.lastName = lastName.trim();
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'Provide firstName and/or lastName' });
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update current user' });
  }
});

module.exports = router;
