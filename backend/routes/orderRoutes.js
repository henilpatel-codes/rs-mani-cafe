const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { placeOrder, getAllOrders, getOrderById, updateOrderStatus, cancelOrder, addReview, getDashboardStats, exportDailyCSV } = require('../controllers/orderController');

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/export/csv', protect, adminOnly, exportDailyCSV);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', getOrderById);          // public — for order tracking
router.post('/', placeOrder);              // public — guest orders allowed
router.put('/:id', protect, adminOnly, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/review', protect, addReview);

module.exports = router;
