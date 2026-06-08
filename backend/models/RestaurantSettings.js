// models/RestaurantSettings.js — singleton settings doc
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: true },
    gstPercentage: { type: Number, default: 5 },
    deliveryCharge: { type: Number, default: 30 },
    freeDeliveryAbove: { type: Number, default: 500 },
    estimatedDeliveryTime: { type: Number, default: 30 }, // minutes
    restaurantName: { type: String, default: 'RS MANI Café' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
     // New practical fields
    minOrderAmount: { type: Number, default: 0 },
    servicedPincodes: { type: String, default: '' }, // comma-separated list, empty = all allowed
    codEnabled: { type: Boolean, default: true },
    codDisabledReason: {
      type: String,
      default: 'Cash on Delivery is temporarily unavailable. Please pay online.',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RestaurantSettings', settingsSchema);
