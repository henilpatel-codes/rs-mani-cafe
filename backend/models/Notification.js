// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerName: { type: String, required: true, trim: true },
    total: { type: Number, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['new_order', 'status_update', 'payment'], default: 'new_order' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
