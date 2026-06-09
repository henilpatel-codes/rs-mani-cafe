// controllers/orderController.js — Full order lifecycle
const crypto = require('crypto');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const RestaurantSettings = require('../models/RestaurantSettings');
const { getIO } = require('../config/socket');

const sanitizeOrderForResponse = (order, user) => {
  const safeOrder = order.toObject ? order.toObject() : { ...order };

  const isOwner =
    safeOrder.userId && safeOrder.userId.toString() === user?.id;

  const canShowDeliveryOTP =
    isOwner &&
    safeOrder.orderType === 'delivery' &&
    !['Delivered', 'Cancelled'].includes(safeOrder.status);

  if (!canShowDeliveryOTP) {
    delete safeOrder.deliveryOTP;
  }

  return safeOrder;
};

// @route POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      orderType,
      tableNumber,
      deliveryAddress,
      items,
      specialInstructions,
      paymentMethod,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
      couponCode,
    } = req.body;

    const settings = await RestaurantSettings.findOne();

    if (settings && !settings.isOpen) {
      return res.status(400).json({
        message: 'Restaurant is currently closed. Please try again later.',
      });
    }

    if (!customerName || !phone) {
      return res.status(400).json({
        message: 'Customer name and phone are required',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Order items are required',
      });
    }

    const finalOrderType = orderType || 'takeaway';
    const finalPaymentMethod = (paymentMethod || 'cod').toLowerCase();

    if (
      finalOrderType === 'delivery' &&
      finalPaymentMethod === 'cod' &&
      settings?.codEnabled === false
    ) {
      return res.status(400).json({
        message:
          settings.codDisabledReason ||
          'Cash on Delivery is currently not available for delivery orders. Please pay online.',
      });
    }

    if (settings?.minOrderAmount > 0) {
      const roughTotal = items.reduce(
        (s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0),
        0
      );

      if (roughTotal < settings.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount is ₹${settings.minOrderAmount}`,
        });
      }
    }

    if (finalOrderType === 'delivery' && settings?.servicedPincodes) {
      const allowed = settings.servicedPincodes
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      if (allowed.length > 0 && deliveryAddress?.pincode) {
        if (!allowed.includes(deliveryAddress.pincode.trim())) {
          return res.status(400).json({
            message: `Sorry, we don't deliver to pincode ${deliveryAddress.pincode}. Serviceable: ${allowed.join(', ')}`,
          });
        }
      }
    }

    let subtotal = 0;
    const enrichedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);

      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          message: `Item "${item.name || item.itemId}" is not available`,
        });
      }

      const quantity = Number(item.quantity) || 1;

      await MenuItem.findByIdAndUpdate(item.itemId, {
        $inc: { orderCount: quantity },
      });

      enrichedItems.push({
        itemId: item.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      });

      subtotal += menuItem.price * quantity;
    }

    const gstPct = settings?.gstPercentage ?? 5;
    let deliveryCharge = 0;

    if (finalOrderType === 'delivery') {
      deliveryCharge =
        settings?.freeDeliveryAbove && subtotal >= settings.freeDeliveryAbove
          ? 0
          : settings?.deliveryCharge ?? 30;
    }

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid coupon code' });
      }

      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order ₹${coupon.minOrderAmount} required for this coupon`,
        });
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = Math.min(
          (subtotal * coupon.discountValue) / 100,
          coupon.maxDiscount || Infinity
        );
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }

      discountAmount = Math.round(discountAmount);

      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { usedCount: 1 },
      });

      appliedCoupon = coupon.code;
    }

    const gstAmount = Math.round(((subtotal - discountAmount) * gstPct) / 100);
    const total = subtotal + gstAmount + deliveryCharge - discountAmount;

    const deliveryOTP =
      finalOrderType === 'delivery'
        ? String(Math.floor(1000 + Math.random() * 9000))
        : null;

    let finalPaymentStatus = 'pending';
    let finalPaymentId = null;
    let finalRazorpayOrderId = null;

    if (finalPaymentMethod === 'razorpay') {
      if (!paymentId || !razorpayOrderId || !razorpaySignature) {
        return res.status(400).json({
          message: 'Payment verification details are missing',
        });
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keySecret || keySecret.startsWith('XXX')) {
        return res.status(503).json({
          message: 'Razorpay is not configured',
        });
      }

      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${paymentId}`)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature);
      const receivedBuffer = Buffer.from(razorpaySignature);

      const isValidSignature =
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

      if (!isValidSignature) {
        return res.status(400).json({
          message: 'Payment verification failed',
        });
      }

      finalPaymentStatus = 'paid';
      finalPaymentId = paymentId;
      finalRazorpayOrderId = razorpayOrderId;
    }

    const order = await Order.create({
      userId: req.user.id,
      deliveryOTP,
      customerName,
      phone,
      orderType: finalOrderType,
      tableNumber: tableNumber || '',
      deliveryAddress: deliveryAddress || {},
      items: enrichedItems,
      subtotal,
      gstAmount,
      deliveryCharge,
      discountAmount,
      total,
      couponCode: appliedCoupon || '',
      specialInstructions: specialInstructions || '',
      paymentMethod: finalPaymentMethod,
      paymentStatus: finalPaymentStatus,
      paymentId: finalPaymentId,
      razorpayOrderId: finalRazorpayOrderId,
      estimatedTime: settings?.estimatedDeliveryTime || 30,
    });

    const notification = await Notification.create({
      orderId: order._id,
      customerName,
      total: order.total,
      message: `New order #${order.invoiceNumber} from ${customerName} — ₹${order.total}`,
    });

    const io = getIO();

    if (io) {
      io.to('admin_room').emit('new_order', {
        _id: notification._id,
        orderId: order._id,
        customerName,
        total: order.total,
        invoiceNumber: order.invoiceNumber,
        message: notification.message,
        isRead: false,
        createdAt: notification.createdAt,
      });
    }

    return res.status(201).json(sanitizeOrderForResponse(order, req.user));
  } catch (err) {
    console.error('placeOrder error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status && status !== 'all' ? { status } : {};

    const orders = await Order.find(query)
      .select('-deliveryOTP')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('deliveryBoy', 'name phone');

    const total = await Order.countDocuments(query);

    return res.json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'deliveryBoy',
      'name phone'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin';

    const isOwner =
      order.userId && order.userId.toString() === req.user?.id;

    const isAssignedDelivery =
      req.user?.role === 'delivery' &&
      order.deliveryBoy &&
      order.deliveryBoy._id &&
      order.deliveryBoy._id.toString() === req.user?.id;

    if (!isAdmin && !isOwner && !isAssignedDelivery) {
      return res.status(403).json({
        message: 'Not allowed to view this order',
      });
    }

    return res.json(sanitizeOrderForResponse(order, req.user));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryBoyId, estimatedTime, cancellationReason } = req.body;

    const update = {};

    if (status) {
      update.status = status;
      update.deliveryStatus = status;
    }

    if (deliveryBoyId !== undefined) {
      update.deliveryBoy = deliveryBoyId || null;
    }

    if (estimatedTime) {
      update.estimatedTime = estimatedTime;
    }

    if (cancellationReason) {
      update.cancellationReason = cancellationReason;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate('deliveryBoy', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const io = getIO();

    if (io) {
      io.emit('order_status_update', {
        orderId: order._id,
        status: order.status,
        deliveryStatus: order.deliveryStatus,
        estimatedTime: order.estimatedTime,
      });
    }

    return res.json(sanitizeOrderForResponse(order, req.user));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/cancel (customer)
const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (['Preparing', 'Packed', 'Out for Delivery', 'Delivered'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled at this stage',
      });
    }

    if (
      req.user?.role !== 'admin' &&
      order.userId &&
      order.userId.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        message: 'Not authorized to cancel this order',
      });
    }

    order.status = 'Cancelled';
    order.deliveryStatus = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by customer';

    await order.save();

    const io = getIO();

    if (io) {
      io.emit('order_status_update', {
        orderId: order._id,
        status: 'Cancelled',
      });
    }

    return res.json(sanitizeOrderForResponse(order, req.user));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route POST /api/orders/:id/review (customer)
const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({
        message: 'Can only review delivered orders',
      });
    }

    if (
      req.user?.role !== 'admin' &&
      order.userId &&
      order.userId.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        message: 'Not authorized to review this order',
      });
    }

    order.rating = rating;
    order.review = review;

    await order.save();

    for (const item of order.items) {
      const allOrders = await Order.find({
        'items.itemId': item.itemId,
        rating: { $ne: null },
      });

      const avgRating =
        allOrders.reduce((s, o) => s + o.rating, 0) / allOrders.length;

      await MenuItem.findByIdAndUpdate(item.itemId, {
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: allOrders.length,
      });
    }

    return res.json(sanitizeOrderForResponse(order, req.user));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const revenueMatch = {
      status: { $ne: 'Cancelled' },
      $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'cod' }],
    };

    const [
      totalOrders,
      todayOrders,
      pendingOrders,
      revenueAgg,
      todayRevenueAgg,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({
        status: { $in: ['Pending', 'Accepted', 'Preparing', 'Packed'] },
      }),
      Order.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        {
          $match: {
            ...revenueMatch,
            createdAt: { $gte: startOfDay },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.find()
        .select('-deliveryOTP')
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('deliveryBoy', 'name'),
    ]);

    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.itemId',
          name: { $first: '$items.name' },
          totalOrdered: { $sum: '$items.quantity' },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 },
    ]);

    return res.json({
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue: revenueAgg[0]?.total || 0,
      todayRevenue: todayRevenueAgg[0]?.total || 0,
      statusCounts,
      popularItems,
      recentOrders,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/export/csv?date=YYYY-MM-DD (admin)
const exportDailyCSV = async (req, res) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);

    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    })
      .select('-deliveryOTP')
      .populate('deliveryBoy', 'name');

    const rows = [
      [
        'Invoice',
        'Date',
        'Customer',
        'Phone',
        'Type',
        'Items',
        'Subtotal',
        'GST',
        'Delivery Charge',
        'Discount',
        'Total',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Delivery Boy',
      ].join(','),
      ...orders.map((o) =>
        [
          o.invoiceNumber,
          new Date(o.createdAt).toLocaleString('en-IN'),
          `"${o.customerName}"`,
          o.phone,
          o.orderType,
          `"${o.items.map((i) => `${i.name} x${i.quantity}`).join('; ')}"`,
          o.subtotal,
          o.gstAmount,
          o.deliveryCharge,
          o.discountAmount,
          o.total,
          o.paymentMethod,
          o.paymentStatus,
          o.status,
          o.deliveryBoy?.name || '',
        ].join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="orders-${dateStr}.csv"`
    );

    return res.send(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addReview,
  getDashboardStats,
  exportDailyCSV,
};