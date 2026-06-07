const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getMenuItems, getPopularItems, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem } = require('../controllers/menuController');

router.get('/', getMenuItems);
router.get('/popular', getPopularItems);
router.post('/', protect, adminOnly, addMenuItem);
router.put('/:id', protect, adminOnly, updateMenuItem);
router.put('/:id/toggle', protect, adminOnly, toggleAvailability);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
