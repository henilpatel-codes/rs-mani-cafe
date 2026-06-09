// middleware/authMiddleware.js — JWT + role-based guards
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, isAdmin }
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

const deliveryOnly = (req, res, next) => {
  if (req.user?.role !== 'delivery' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Delivery access required' });
  }

  next();
};

const customerOnly = (req, res, next) => {
  if (!['customer', 'admin'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Customer access required' });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
  deliveryOnly,
  customerOnly,
};