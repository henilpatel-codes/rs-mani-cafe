const express = require('express');
const router = express.Router();

const { protect, adminOnly, customerOnly } = require('../middleware/authMiddleware');

const {
  placeOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addReview,
  getDashboardStats,
  exportDailyCSV,
} = require('../controllers/orderController');

// Admin routes
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/export/csv', protect, adminOnly, exportDailyCSV);
router.get('/', protect, adminOnly, getAllOrders);

// Public order tracking route
router.get('/:id', getOrderById);

// Customer order route
router.post('/', protect, customerOnly, placeOrder);

// Protected order actions
router.put('/:id', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/review', protect, addReview);

module.exports = router;