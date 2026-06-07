const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser, verifyOTP, resendOTP, loginUser,
  forgotPassword, resetPassword, getMe, updateProfile,
  toggleFavorite, getUserOrders, getDeliveryBoys,
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/:userId/favorites/:itemId', protect, toggleFavorite);
router.get('/:userId/orders', protect, getUserOrders);
router.get('/delivery-boys/list', protect, getDeliveryBoys);

module.exports = router;
