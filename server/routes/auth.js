const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

// Safety check for the secret key
if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is required");
}

// POST /api/auth/register
// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Requirement 4.1: Password must contain at least one uppercase letter and one number
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: "Password must contain at least one uppercase letter and one number" 
            });
        }

        // Note: Your model currently uses 'name'. 
        // We combine them here to fit your current schema, 
        // or you can update your model to have separate firstName/lastName fields.
        const fullName = `${firstName} ${lastName}`;

        const user = new User({ 
            name: fullName, 
            email, 
            passwordHash: password // The pre-save hook in User.js will hash this
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // Handle duplicate email error (Mongo error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

// POST /api/auth/login
// Login user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // We use .select('+passwordHash') because your model marks it as 'select: false'
        const user = await User.findOne({ email }).select('+passwordHash');

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Use the method defined in your User model
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// OST /api/auth/logout
// Logout user (Informational)
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
// Get current authenticated user info
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-passwordHash");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user information" });
    }
});

module.exports = router;