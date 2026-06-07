// models/User.js — Upgraded with roles, OTP, password reset
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['customer', 'admin', 'delivery'], default: 'customer' },
    // Legacy field kept for backward compat
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    // OTP Email Verification
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    // Forgot Password
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
    // Delivery boy info
    isActive: { type: Boolean, default: true },
    vehicleNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // Sync isAdmin with role
  this.isAdmin = this.role === 'admin';
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
