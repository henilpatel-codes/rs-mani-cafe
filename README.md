# RS MANI Café — Production-Ready Restaurant Ordering System

A full-stack restaurant ordering system built with **React + Vite** (frontend) and **Node.js + Express + MongoDB Atlas** (backend). Supports customer ordering, admin management, and a delivery-boy panel with real-time Socket.IO updates.

---

## Table of Contents

1. [Software Required](#1-software-required)
2. [Project Structure](#2-project-structure)
3. [MongoDB Atlas Setup](#3-mongodb-atlas-setup)
4. [Razorpay Setup](#4-razorpay-setup)
5. [Backend Setup](#5-backend-setup)
6. [Frontend Setup](#6-frontend-setup)
7. [Environment Variables](#7-environment-variables)
8. [Creating the First Admin User](#8-creating-the-first-admin-user)
9. [How to Test — Customer Flow](#9-how-to-test--customer-flow)
10. [How to Test — Admin Flow](#10-how-to-test--admin-flow)
11. [How to Test — Delivery Flow](#11-how-to-test--delivery-flow)
12. [Deployment](#12-deployment)
13. [Features Summary](#13-features-summary)

---

## 1. Software Required

| Software | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Backend runtime |
| npm | 9+ | Package manager |
| Git | any | Version control |
| MongoDB Atlas account | free tier OK | Database |
| Razorpay account | test mode OK | Payments |
| Gmail account | any | OTP/reset emails |

---

## 2. Project Structure

```
rs_mani_cafe/
├── backend/
│   ├── config/          # DB + Socket.IO setup
│   ├── controllers/     # Business logic
│   ├── middleware/      # JWT auth + role guards
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # Email service
│   ├── server.js        # Entry point
│   ├── .env.example     # Copy to .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/  # Navbar, AdminLayout
    │   ├── context/     # AuthContext, CartContext
    │   ├── pages/       # All pages
    │   └── utils/       # Axios instance
    ├── .env.example     # Copy to .env
    └── package.json
```

---

## 3. MongoDB Atlas Setup

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → create a free account.
2. Create a **new project** → click **Build a Database** → choose **Free (M0)**.
3. Choose a cloud provider/region → click **Create**.
4. Set a **database username** and **password** (save these).
5. Under **Network Access** → **Add IP Address** → click **Allow Access from Anywhere** (`0.0.0.0/0`) for deployment, or add your specific IP for local dev.
6. Go to **Database** → click **Connect** → **Drivers** → copy the connection string.
7. Replace `<password>` with your DB password and `myFirstDatabase` with `rs_mani_cafe`.

**Example URI:**
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/rs_mani_cafe?retryWrites=true&w=majority
```

Paste this as `MONGO_URI` in `backend/.env`.

---

## 4. Razorpay Setup

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) → sign up.
2. Stay in **Test Mode** for development.
3. Go to **Settings → API Keys** → **Generate Key**.
4. Copy **Key ID** → paste as `RAZORPAY_KEY_ID` in `backend/.env` AND `VITE_RAZORPAY_KEY_ID` in `frontend/.env`.
5. Copy **Key Secret** → paste as `RAZORPAY_KEY_SECRET` in `backend/.env` only (never expose in frontend).

> **Note:** COD always works without Razorpay keys. Razorpay is only required for online payments.

---

## 5. Backend Setup

```bash
cd backend

# 1. Copy env file
cp .env.example .env

# 2. Fill in your values (see Section 7)
nano .env        # or open in any editor

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Verify it's running
# Open: http://localhost:5000/health
```

Expected output:
```
🚀 RS MANI Café API running on port 5000
📡 Environment: development
✅ MongoDB Connected: cluster0.xxx.mongodb.net
```

---

## 6. Frontend Setup

```bash
cd frontend

# 1. Copy env file
cp .env.example .env

# 2. Fill in your values (see Section 7)
nano .env

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

> The Vite dev server automatically proxies `/api` and `/socket.io` to `http://localhost:5000`, so you don't need CORS issues locally.

---

## 7. Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://user:pass@cluster0.xxx.mongodb.net/rs_mani_cafe?retryWrites=true&w=majority

# JWT — use a long random string (min 32 chars)
JWT_SECRET=change_this_to_a_random_32char_secret_key

# Razorpay (leave blank to use COD only)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# Gmail App Password for OTP emails
# Enable at: Google Account → Security → 2-Step → App Passwords
EMAIL_USER=your@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx

# Frontend URL for CORS (no trailing slash)
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`

```env
# Backend URL (no trailing slash)
VITE_API_URL=http://localhost:5000

# Razorpay public key (safe to expose)
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

---

## 8. Creating the First Admin User

After both servers are running, call the seed endpoint **once**:

```bash
curl -X POST http://localhost:5000/api/admin/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@rsmani.com","password":"admin123"}'
```

Or use a REST client (Postman / Thunder Client):
- **POST** `http://localhost:5000/api/admin/seed-admin`
- Body (JSON): `{ "name": "Admin", "email": "admin@rsmani.com", "password": "admin123" }`

Then log in at `http://localhost:5173/login` with those credentials.

> This endpoint returns an error if an admin already exists, so it is safe to leave enabled.

---

## 9. How to Test — Customer Flow

1. Open `http://localhost:5173`
2. Click **Sign Up** → fill details → receive OTP on email → verify.
   - If email is not configured, check backend console for the OTP log line.
3. Browse **Menu** → add items to cart.
4. Go to **Cart** → review → click **Checkout**.
5. Choose order type: **Takeaway / Dine-In / Delivery**.
   - For delivery, enter address + pincode (must be in serviceable list if configured).
6. Apply a coupon code if any exist (create one in admin first).
7. Choose **COD** or **Pay Online (Razorpay)**.
   - For Razorpay test: use card `4111 1111 1111 1111`, any future date, CVV `123`.
8. After placing order, you land on the **Payment Success** page.
9. Click **Track Order** — watch status update live as admin changes it.
10. For delivery orders, your **4-digit OTP** is shown on the tracking page.

---

## 10. How to Test — Admin Flow

1. Log in with admin credentials at `http://localhost:5173/login`.
2. You are redirected to `/admin` (Dashboard).

**Dashboard:**
- See live stats: total orders, today's orders, pending, revenue.
- New orders trigger a **beep sound** and toast notification (Socket.IO).
- Use the **CSV export** to download orders for any date.
- Toggle restaurant **Open / Closed** from the status banner.

**Orders (`/admin/orders`):**
- Filter by status, search by name/invoice/phone.
- Click **Manage** on any order to:
  - Change status (Pending → Accepted → Preparing → Packed → Out for Delivery → Delivered / Cancelled)
  - Assign a delivery boy (for delivery orders)
  - Set estimated time
  - Print **KOT** (Kitchen Order Ticket) — opens a print dialog
  - Send **WhatsApp** message to customer

**Menu (`/admin/menu`):**
- Add / edit / delete items.
- Toggle **Available / Unavailable** per item.

**Coupons (`/admin/coupons`):**
- Create percentage or flat-amount coupons.
- Set usage limits, expiry dates, minimum order amounts.

**Delivery Boys (`/admin/delivery-boys`):**
- Create delivery staff accounts (email + password).
- Activate / deactivate accounts.

**Settings (`/admin/settings`):**
- Toggle restaurant open/closed.
- Set GST %, delivery charge, free-delivery threshold, estimated time.
- Set **minimum order amount**.
- Set **serviceable pincodes** (comma-separated).

---

## 11. How to Test — Delivery Flow

1. Create a delivery boy account from `/admin/delivery-boys`.
2. Log in at `http://localhost:5173/delivery/login` with their credentials.
3. The dashboard shows **active assigned orders**.
4. Advance each order through statuses using the button on each card.
5. When marking **Delivered**:
   - If the order has a delivery OTP, a modal appears.
   - Enter the 4-digit OTP shown to the customer on their tracking page.
   - On correct OTP → order marked Delivered.

---

## 12. Deployment

### Backend → Render (free tier)

1. Push `backend/` folder to a GitHub repo.
2. Go to [https://render.com](https://render.com) → **New Web Service**.
3. Connect your repo. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Node version:** 18
4. Add all environment variables from `backend/.env` under **Environment**.
5. Set `NODE_ENV=production` and `FRONTEND_URL=https://your-app.vercel.app`.
6. Deploy. Copy your Render URL (e.g. `https://rs-mani-cafe-api.onrender.com`).

### Frontend → Vercel

1. Push `frontend/` folder to a GitHub repo.
2. Go to [https://vercel.com](https://vercel.com) → **New Project** → import repo.
3. Add environment variables:
   - `VITE_API_URL` = your Render backend URL (no trailing slash)
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay key ID
4. Deploy. Vercel auto-detects Vite.

### Post-deployment checklist

- [ ] Update `FRONTEND_URL` in Render env vars to match Vercel URL.
- [ ] Run seed-admin against the production URL.
- [ ] Test a full order flow end-to-end.
- [ ] Add your production domain to MongoDB Atlas Network Access if needed.
- [ ] Switch Razorpay from Test mode to Live mode when ready.

---

## 13. Features Summary

| Feature | Details |
|---|---|
| Authentication | JWT, OTP email verification, forgot/reset password |
| Roles | customer, admin, delivery |
| Menu | Categories, availability toggle, ratings |
| Cart | Persistent in session, qty controls |
| Orders | Dine-in / Takeaway / Delivery |
| Delivery address | Street, city, pincode, landmark |
| Coupons | Percentage & flat, usage limits, expiry |
| GST | Configurable % applied at checkout |
| Delivery charges | Auto waived above threshold |
| Min order amount | Configurable, validated frontend + backend |
| Pincode check | Serviceable zones, validated frontend + backend |
| Payments | Razorpay (online) + COD |
| Delivery OTP | 4-digit OTP customer shares with delivery boy |
| Real-time updates | Socket.IO order status, admin new-order alerts |
| Alert sound | Web Audio API beep on new order in admin |
| KOT print | Kitchen Order Ticket print popup from admin |
| CSV export | Daily sales export from admin dashboard |
| Invoice | Printable/WhatsApp-shareable invoice per order |
| Reviews | Star rating + text after delivery |
| Repeat order | Re-add past order items to cart |
| Cancel order | Customer cancel before Preparing stage |
| Delivery panel | Assigned orders, status advance, OTP confirm |
| Admin dashboard | Stats, revenue, popular items, recent orders |
| WhatsApp button | Pre-filled message to customer from admin |
| Responsive UI | Works on mobile and desktop |
