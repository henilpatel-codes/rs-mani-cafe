// models/Order.js — Upgraded with delivery, invoice, coupon, GST
const mongoose = require('mongoose');

let counter = 0;

const orderSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: [true, 'Customer name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone is required'] },
    // Order type
    orderType: { type: String, enum: ['dine-in', 'takeaway', 'delivery'], default: 'takeaway' },
    tableNumber: { type: String, default: '' },
    // Delivery address
    deliveryAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      pincode: { type: String, default: '' },
      landmark: { type: String, default: '' },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    // Items
    items: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: String,
        price: Number,
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    // Pricing
    subtotal: { type: Number, required: true, min: 0 },
    gstAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    couponCode: { type: String, default: '' },
    // Status
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    specialInstructions: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    estimatedTime: { type: Number, default: 30 }, // minutes
    // Payment
    paymentMethod: { type: String, enum: ['cod', 'razorpay'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    paymentId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null },
    // Delivery
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryStatus: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    // Delivery OTP (4-digit, shown to customer, delivery boy must confirm)
    deliveryOTP: { type: String, default: null },
    // Review
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate invoice number before save
orderSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const yymm = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.invoiceNumber = `INV-${yymm}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
