// controllers/deliveryController.js
const Order = require('../models/Order');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { getIO } = require('../config/socket');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, isAdmin: false },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const hideDeliveryOTP = (order) => {
  const safeOrder = order.toObject ? order.toObject() : { ...order };
  delete safeOrder.deliveryOTP;
  return safeOrder;
};

// @route POST /api/delivery/login
const deliveryLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'delivery' });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/delivery/orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryBoy: req.user.id,
      status: { $nin: ['Delivered', 'Cancelled'] },
    })
      .select('-deliveryOTP')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/delivery/orders/history
const getMyOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryBoy: req.user.id,
      status: { $in: ['Delivered', 'Cancelled'] },
    })
      .select('-deliveryOTP')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/delivery/orders/:id/status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, deliveryOTP } = req.body;

    const validStatuses = [
      'Accepted',
      'Preparing',
      'Packed',
      'Out for Delivery',
      'Delivered',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      deliveryBoy: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found or not assigned to you',
      });
    }

    // OTP required only while marking delivery order as Delivered
    if (
      status === 'Delivered' &&
      order.orderType === 'delivery' &&
      order.deliveryOTP
    ) {
      if (!deliveryOTP) {
        return res.status(400).json({
          message: 'Delivery OTP is required to mark as delivered',
          requiresOTP: true,
        });
      }

      if (order.deliveryOTP !== String(deliveryOTP).trim()) {
        return res.status(400).json({
          message: 'Incorrect delivery OTP. Please ask the customer.',
          requiresOTP: true,
        });
      }
    }

    order.deliveryStatus = status;
    order.status = status;

    await order.save();

    const io = getIO();

    if (io) {
      io.emit('order_status_update', {
        orderId: order._id,
        status,
        deliveryStatus: status,
      });
    }

    res.json(hideDeliveryOTP(order));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  deliveryLogin,
  getMyOrders,
  getMyOrderHistory,
  updateDeliveryStatus,
};