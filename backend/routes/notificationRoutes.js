const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationController');

router.get('/', protect, adminOnly, getAllNotifications);
router.put('/read-all', protect, adminOnly, markAllAsRead);
router.put('/:id/read', protect, adminOnly, markAsRead);
router.delete('/:id', protect, adminOnly, deleteNotification);

module.exports = router;
