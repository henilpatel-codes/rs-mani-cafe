// models/MenuItem.js — Upgraded with ratings
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Item name is required'], trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Dosas', 'Idli', 'Beverages', 'Combos', 'Snacks', 'Rice', 'Breads', 'Sweets'],
    },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    image: { type: String, default: '' },
    description: { type: String, trim: true, default: '' },
    isAvailable: { type: Boolean, default: true },
    orderCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVeg: { type: Boolean, default: true },
    spiceLevel: { type: String, enum: ['mild', 'medium', 'hot'], default: 'mild' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
