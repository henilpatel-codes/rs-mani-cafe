const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getSettings, updateSettings } = require('../controllers/settingsController');

router.get('/', getSettings);             // public — frontend needs to check isOpen
router.put('/', protect, adminOnly, updateSettings);

module.exports = router;
