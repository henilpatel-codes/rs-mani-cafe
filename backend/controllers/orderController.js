// controllers/orderController.js — Full order lifecycle
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const RestaurantSettings = require('../models/RestaurantSettings');
const { getIO } = require('../config/socket');

// @route POST /api/orders
const placeOrder = async (req, res) => {
  try {
    const {
      userId, customerName, phone, orderType, tableNumber,
      deliveryAddress, items, specialInstructions,
      paymentMethod, paymentStatus, paymentId, razorpayOrderId,
      couponCode,
    } = req.body;

    const settings = await RestaurantSettings.findOne();
    if (settings && !settings.isOpen) {
      return res.status(400).json({ message: 'Restaurant is currently closed. Please try again later.' });
    }
    // COD availability check
    if (orderType === 'delivery' && paymentMethod === 'cod' && settings?.codEnabled === false) {
      return res.status(400).json({
        message: settings.codDisabledReason || 'Cash on Delivery is currently not available for delivery orders. Please pay online.',
      });
    }
    

    // Minimum order amount check
    if (settings?.minOrderAmount > 0) {
      const roughTotal = req.body.items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
      if (roughTotal < settings.minOrderAmount) {
        return res.status(400).json({ message: `Minimum order amount is ₹${settings.minOrderAmount}` });
      }
    }

    // Delivery pincode check
    if (req.body.orderType === 'delivery' && settings?.servicedPincodes) {
      const allowed = settings.servicedPincodes.split(',').map(p => p.trim()).filter(Boolean);
      if (allowed.length > 0 && req.body.deliveryAddress?.pincode) {
        if (!allowed.includes(req.body.deliveryAddress.pincode.trim())) {
          return res.status(400).json({ message: `Sorry, we don't deliver to pincode ${req.body.deliveryAddress.pincode}. Serviceable: ${allowed.join(', ')}` });
        }
      }
    }

    // Build items with snapshots
    let subtotal = 0;
    const enrichedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({ message: `Item "${item.name || item.itemId}" is not available` });
      }
      await MenuItem.findByIdAndUpdate(item.itemId, { $inc: { orderCount: item.quantity } });
      enrichedItems.push({ itemId: item.itemId, name: menuItem.name, price: menuItem.price, quantity: item.quantity });
      subtotal += menuItem.price * item.quantity;
    }

    // Delivery charge
    const gstPct = settings?.gstPercentage ?? 5;
    let deliveryCharge = 0;
    if (orderType === 'delivery') {
      deliveryCharge = (settings?.freeDeliveryAbove && subtotal >= settings.freeDeliveryAbove) ? 0 : (settings?.deliveryCharge ?? 30);
    }

    // Coupon
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) return res.status(400).json({ message: 'Invalid coupon code' });
      if (coupon.expiryDate && coupon.expiryDate < new Date()) return res.status(400).json({ message: 'Coupon has expired' });
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ message: 'Coupon usage limit reached' });
      if (subtotal < coupon.minOrderAmount) return res.status(400).json({ message: `Minimum order ₹${coupon.minOrderAmount} required for this coupon` });

      if (coupon.discountType === 'percentage') {
        discountAmount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
      } else {
        discountAmount = Math.min(coupon.discountValue, subtotal);
      }
      discountAmount = Math.round(discountAmount);
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      appliedCoupon = coupon.code;
    }

    const gstAmount = Math.round(((subtotal - discountAmount) * gstPct) / 100);
    const total = subtotal + gstAmount + deliveryCharge - discountAmount;

    // Generate 4-digit delivery OTP for delivery orders
    const deliveryOTP = orderType === 'delivery'
      ? String(Math.floor(1000 + Math.random() * 9000))
      : null;

    const order = await Order.create({
      userId: userId || null,
      deliveryOTP,
      customerName,
      phone,
      orderType: orderType || 'takeaway',
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
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (paymentStatus || 'pending'),
      paymentId: paymentId || null,
      razorpayOrderId: razorpayOrderId || null,
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

    res.status(201).json(order);
  } catch (err) {
    console.error('placeOrder error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('deliveryBoy', 'name phone');
    const total = await Order.countDocuments(query);
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('deliveryBoy', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveryBoyId, estimatedTime, cancellationReason } = req.body;
    const update = {};
    if (status) { update.status = status; update.deliveryStatus = status; }
    if (deliveryBoyId !== undefined) update.deliveryBoy = deliveryBoyId || null;
    if (estimatedTime) update.estimatedTime = estimatedTime;
    if (cancellationReason) update.cancellationReason = cancellationReason;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .populate('deliveryBoy', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const io = getIO();
    if (io) {
      io.emit('order_status_update', { orderId: order._id, status: order.status, deliveryStatus: order.deliveryStatus, estimatedTime: order.estimatedTime });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/orders/:id/cancel (customer)
const cancelOrder = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (['Preparing', 'Packed', 'Out for Delivery', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
    }
    // Check ownership
    if (order.userId && order.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    order.status = 'Cancelled';
    order.deliveryStatus = 'Cancelled';
    order.cancellationReason = cancellationReason || 'Cancelled by customer';
    await order.save();

    const io = getIO();
    if (io) io.emit('order_status_update', { orderId: order._id, status: 'Cancelled' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/orders/:id/review (customer)
const addReview = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Delivered') return res.status(400).json({ message: 'Can only review delivered orders' });

    order.rating = rating;
    order.review = review;
    await order.save();

    // Update avg ratings for ordered items
    for (const item of order.items) {
      const allOrders = await Order.find({ 'items.itemId': item.itemId, rating: { $ne: null } });
      const avgRating = allOrders.reduce((s, o) => s + o.rating, 0) / allOrders.length;
      await MenuItem.findByIdAndUpdate(item.itemId, { avgRating: Math.round(avgRating * 10) / 10, reviewCount: allOrders.length });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/orders/stats (admin)
const getDashboardStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, pendingOrders, revenueAgg, todayRevenueAgg, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ status: { $in: ['Pending', 'Accepted', 'Preparing', 'Packed'] } }),
      Order.aggregate([{ $match: { status: { $ne: 'Cancelled' }, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfDay }, status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('deliveryBoy', 'name'),
    ]);

    const statusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.itemId', name: { $first: '$items.name' }, totalOrdered: { $sum: '$items.quantity' } } },
      { $sort: { totalOrdered: -1 } },
      { $limit: 5 },
    ]);

    res.json({
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
    res.status(500).json({ message: err.message });
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

    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } })
      .populate('deliveryBoy', 'name');

    const rows = [
      ['Invoice', 'Date', 'Customer', 'Phone', 'Type', 'Items', 'Subtotal', 'GST', 'Delivery Charge', 'Discount', 'Total', 'Payment Method', 'Payment Status', 'Order Status', 'Delivery Boy'].join(','),
      ...orders.map(o => [
        o.invoiceNumber,
        new Date(o.createdAt).toLocaleString('en-IN'),
        `"${o.customerName}"`,
        o.phone,
        o.orderType,
        `"${o.items.map(i => `${i.name} x${i.quantity}`).join('; ')}"`,
        o.subtotal,
        o.gstAmount,
        o.deliveryCharge,
        o.discountAmount,
        o.total,
        o.paymentMethod,
        o.paymentStatus,
        o.status,
        o.deliveryBoy?.name || '',
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${dateStr}.csv"`);
    res.send(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { placeOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, addReview, getDashboardStats, exportDailyCSV };
