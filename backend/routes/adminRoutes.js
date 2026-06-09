// Admin-only routes for user management
const express = require('express');
const router = express.Router();

const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get all users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select(
      '-password -otp -resetPasswordToken'
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create delivery boy
router.post('/delivery-boy', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone, vehicleNumber } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      vehicleNumber,
      role: 'delivery',
      isVerified: true,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      vehicleNumber: user.vehicleNumber,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle user active status
router.put('/users/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;

    await user.save({ validateBeforeSave: false });

    res.json({
      _id: user._id,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed: create first admin only with SEED_SECRET
router.post('/seed-admin', async (req, res) => {
  try {
    const { name, email, password, seedSecret } = req.body;

    if (!process.env.SEED_SECRET) {
      return res.status(403).json({
        message: 'Admin seed is disabled',
      });
    }

    if (seedSecret !== process.env.SEED_SECRET) {
      return res.status(403).json({
        message: 'Invalid seed secret',
      });
    }

    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      return res.status(400).json({
        message: 'Admin already exists',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true,
    });

    res.status(201).json({
      message: 'Admin created',
      email: admin.email,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;