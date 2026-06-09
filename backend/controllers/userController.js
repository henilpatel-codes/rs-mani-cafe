// controllers/userController.js â€” Roles, OTP, forgot password
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Order = require('../models/Order');
const { generateOTP, sendOTPEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, isAdmin: user.role === 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isAdmin: user.role === 'admin',
  isVerified: user.isVerified,
  favorites: user.favorites,
});

// @route POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await User.create({
      name,
      email,
      password,
      phone,
      otp,
      otpExpiry,
      isVerified: false,
    });

    const emailResult = await sendOTPEmail(email, name, otp);

    if (!emailResult?.success) {
      await User.deleteOne({ email });

      return res.status(502).json({
        message: 'Unable to send OTP email right now. Please try again later.',
      });
    }

    return res.status(201).json({
      message: 'OTP sent to your email. Please verify.',
      email,
      requiresOTP: true,
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route POST /api/users/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP expired. Please resend.' });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user);

    return res.json({
      token,
      user: safeUser(user),
      message: 'Account verified successfully!',
    });
  } catch (err) {
    console.error('[VERIFY OTP ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route POST /api/users/resend-otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailResult = await sendOTPEmail(email, user.name, otp);

    if (!emailResult?.success) {
      return res.status(502).json({
        message: 'Unable to send OTP email right now. Please try again later.',
      });
    }

    return res.json({
      message: 'New OTP sent to your email',
    });
  } catch (err) {
    console.error('[RESEND OTP ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        requiresOTP: true,
        email,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route POST /api/users/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${token}`;

    const emailResult = await sendPasswordResetEmail(email, user.name, resetLink);

    if (!emailResult?.success) {
      return res.status(502).json({
        message: 'Unable to send password reset email right now. Please try again later.',
      });
    }

    return res.json({
      message: 'Password reset link sent to your email',
    });
  } catch (err) {
    console.error('[FORGOT PASSWORD ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route POST /api/users/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error('[RESET PASSWORD ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry'
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(safeUser(user));
  } catch (err) {
    console.error('[GET ME ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/users/me
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    );

    return res.json(safeUser(user));
  } catch (err) {
    console.error('[UPDATE PROFILE ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    if (req.user?.id !== userId) {
      return res.status(403).json({
        message: 'Not allowed to update these favorites',
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const isFavorite = user.favorites.some(
      (favId) => favId.toString() === itemId
    );

    if (isFavorite) {
      user.favorites = user.favorites.filter(
        (favId) => favId.toString() !== itemId
      );
    } else {
      user.favorites.push(itemId);
    }

    await user.save();

    return res.json({
      favorites: user.favorites,
      isFavorite: !isFavorite,
    });
  } catch (err) {
    console.error('[TOGGLE FAVORITE ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/users/:userId/orders
const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      return res.status(403).json({
        message: 'Not allowed to view these orders',
      });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error('[GET USER ORDERS ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/users/delivery-boys (admin)
const getDeliveryBoys = async (req, res) => {
  try {
    const boys = await User.find({ role: 'delivery', isActive: true }).select(
      'name phone vehicleNumber'
    );

    return res.json(boys);
  } catch (err) {
    console.error('[GET DELIVERY BOYS ERROR]', err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  toggleFavorite,
  getUserOrders,
  getDeliveryBoys,
};
