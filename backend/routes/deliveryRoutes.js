const express = require('express');
const router = express.Router();
const { protect, deliveryOnly } = require('../middleware/authMiddleware');
const { deliveryLogin, getMyOrders, getMyOrderHistory, updateDeliveryStatus } = require('../controllers/deliveryController');

router.post('/login', deliveryLogin);
router.get('/orders', protect, deliveryOnly, getMyOrders);
router.get('/orders/history', protect, deliveryOnly, getMyOrderHistory);
router.put('/orders/:id/status', protect, deliveryOnly, updateDeliveryStatus);

module.exports = router;
