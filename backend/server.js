// server.js — RS MANI Café Backend v2.0
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const { setIO } = require('./config/socket');
const { verifyEmailConnection } = require('./utils/emailService');

// Routes
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const couponRoutes = require('./routes/couponRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect DB
connectDB();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

// ─── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── Socket.IO ──────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
});
setIO(io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);
  socket.on('join_admin', () => { socket.join('admin_room'); console.log(`Admin joined: ${socket.id}`); });
  socket.on('join_delivery', (deliveryId) => { socket.join(`delivery_${deliveryId}`); });
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

// ─── Rate Limiting ───────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true });
app.use('/api/', limiter);

// ─── Middleware ──────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV }));
app.get('/', (req, res) => res.json({ message: 'RS MANI Café API v2.0 🍛', docs: '/health' }));

// ─── Error Handler ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`\n🚀 RS MANI Café API running on port ${PORT}\n📡 Environment: ${process.env.NODE_ENV}\n`);

  await verifyEmailConnection();
});
module.exports = { app, server };
