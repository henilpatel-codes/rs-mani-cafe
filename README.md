# RS MANI Café — Restaurant Ordering System

RS MANI Café is a full-stack restaurant ordering web application built using **React + Vite**, **Node.js + Express**, and **MongoDB Atlas**.
It supports customer ordering, admin management, online payments, coupons, delivery assignment, delivery OTP verification, invoices, KOT printing, and image uploads for menu items.

---

## Live Links

* **Frontend:** https://rs-mani-cafe.vercel.app
* **Backend:** https://rs-mani-cafe-backend.onrender.com

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* React Hot Toast
* Lucide React
* Razorpay Checkout
* CSS responsive UI

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* Bcrypt password hashing
* Socket.IO
* Razorpay
* Cloudinary
* Multer
* Nodemailer / Email service

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas
* Image Storage: Cloudinary

---

## Main Features

### Customer Features

* Customer registration and login
* OTP-based account verification
* Menu browsing with categories
* Search menu items
* Add to cart
* Quantity update in cart
* Checkout page
* Order types:

  * Delivery
  * Takeaway
  * Dine-in
* COD and Razorpay online payment
* Coupon apply system
* Order history
* Order tracking
* Invoice page
* Printable invoice
* Customer favorites using heart button
* Favorite items remain saved after refresh
* Review/rating after delivery
* Repeat past orders
* Cancel order before preparation stage

### Admin Features

* Admin login
* Admin dashboard
* View total orders, today orders, pending orders, and revenue
* Revenue includes paid online orders and COD orders
* Cancelled orders excluded from revenue
* Manage all orders
* Update order status
* Assign delivery boy to delivery orders
* Print KOT
* Export orders CSV
* Manage menu items
* Add/edit/delete menu items
* Toggle item availability
* Upload menu item images from gallery using Cloudinary
* Paste image URL manually if needed
* Manage coupons
* Create flat or percentage discount coupons
* Coupon usage limit
* Coupon expiry date
* Coupon minimum order amount
* Manage delivery boys
* Activate/deactivate delivery boy accounts
* Restaurant settings:

  * Open/closed status
  * Minimum order amount
  * GST percentage
  * Delivery charge
  * Free delivery threshold
  * Serviceable pincodes
  * Estimated delivery time
  * WhatsApp settings
  * COD enable/disable for delivery orders

### Delivery Boy Features

* Delivery boy login
* Assigned orders dashboard
* View active assigned orders
* Update delivery status
* Delivery OTP verification before marking delivered
* Delivery history

---

## Security Improvements

* JWT-based protected routes
* Role-based access control:

  * Customer
  * Admin
  * Delivery
* Order creation protected for logged-in users
* Backend uses logged-in user ID instead of trusting frontend user ID
* Razorpay payment verification using backend signature verification
* Frontend payment status is not trusted
* User order ownership check added
* Favorites ownership check added
* Public order tracking secured
* Delivery OTP hidden from admin lists and delivery lists
* Delivery OTP only shown to the actual customer for active delivery orders
* Admin seed route secured using `SEED_SECRET`
* Coupon usage count increments only after successful order creation
* COD setting validated from backend
* Delivery COD depends on admin COD setting

---

## Project Structure

```text
rs_mani_cafe/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── socket.js
│   │   └── cloudinary.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   │   ├── admin/
    │   │   ├── auth/
    │   │   ├── customer/
    │   │   └── delivery/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Environment Variables

### Backend `.env`

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_long_random_jwt_secret

FRONTEND_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SEED_SECRET=your_temporary_seed_secret

EMAIL_SKIP=true
SKIP_EMAIL=true
```

For production on Render:

```env
NODE_ENV=production
FRONTEND_URL=https://rs-mani-cafe.vercel.app
```

Important:

* Do not commit `.env`.
* Keep `JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_API_SECRET`, and `SEED_SECRET` private.
* `SEED_SECRET` should be added only when creating first admin, then removed from Render env after admin is created.

---

### Frontend `.env`

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

For production on Vercel:

```env
VITE_API_URL=https://rs-mani-cafe-backend.onrender.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/henilpatel-codes/rs-mani-cafe.git
cd rs-mani-cafe
```

---

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

---

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

## Creating First Admin

The admin seed route is protected using `SEED_SECRET`.

Add this in backend `.env` temporarily:

```env
SEED_SECRET=your_temporary_seed_secret
```

Then send POST request:

```bash
curl -X POST http://localhost:5000/api/admin/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@rsmani.com","password":"admin123","seedSecret":"your_temporary_seed_secret"}'
```

After admin is created:

* Remove `SEED_SECRET` from production env.
* Restart/redeploy backend.

This disables admin seed route for safety.

---

## Customer Flow Testing

1. Open frontend.
2. Register customer account.
3. Verify OTP.
4. Login as customer.
5. Open menu page.
6. Search/filter menu items.
7. Click heart icon to add/remove favorites.
8. Add items to cart.
9. Go to cart.
10. Proceed to checkout.
11. Select order type:

    * Delivery
    * Takeaway
    * Dine-in
12. Apply coupon if available.
13. Choose payment method:

    * COD
    * Razorpay online payment
14. Place order.
15. View order history.
16. Open invoice.
17. Track order status.

---

## Admin Flow Testing

1. Login as admin.
2. Open admin dashboard.
3. Check stats and revenue.
4. Go to menu management.
5. Add menu item.
6. Upload image from gallery or paste image URL.
7. Toggle item availability.
8. Go to orders.
9. Update order status.
10. Assign delivery boy for delivery order.
11. Print KOT.
12. Export CSV if needed.
13. Create coupon.
14. Update restaurant settings.
15. Enable/disable delivery COD from settings.

---

## Delivery Flow Testing

1. Admin creates delivery boy account.
2. Delivery boy logs in from delivery login page.
3. Assigned orders appear in dashboard.
4. Delivery boy updates order status.
5. Before marking delivered, delivery OTP is required.
6. Customer shares OTP shown on their order tracking page.
7. Correct OTP marks order as delivered.

---

## Payment Notes

### COD

COD works for:

* Takeaway
* Dine-in
* Delivery only if admin has enabled COD for delivery

### Razorpay

Online payment uses Razorpay Checkout.

Backend verifies:

* `razorpay_payment_id`
* `razorpay_order_id`
* `razorpay_signature`

Payment is marked paid only after successful backend verification.

---

## Cloudinary Image Upload

Admin can upload menu images from gallery.

Flow:

1. Admin selects image from menu form.
2. Image goes to backend upload API.
3. Backend uploads to Cloudinary.
4. Cloudinary secure URL is returned.
5. URL is saved in menu item image field.
6. Customer menu displays uploaded image.

Cloudinary env variables required in backend:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Deployment

### Backend Deployment on Render

1. Push code to GitHub.
2. Create new Web Service on Render.
3. Connect GitHub repository.
4. Set root directory if needed:

   ```text
   backend
   ```
5. Build command:

   ```bash
   npm install
   ```
6. Start command:

   ```bash
   node server.js
   ```
7. Add backend environment variables.
8. Deploy.

Important Render env:

```env
NODE_ENV=production
FRONTEND_URL=https://rs-mani-cafe.vercel.app
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

### Frontend Deployment on Vercel

1. Import GitHub repository in Vercel.
2. Set root directory if needed:

   ```text
   frontend
   ```
3. Add environment variables:

```env
VITE_API_URL=https://rs-mani-cafe-backend.onrender.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

4. Deploy.

---

## Production Checklist

* [ ] MongoDB Atlas connected
* [ ] Backend deployed on Render
* [ ] Frontend deployed on Vercel
* [ ] `FRONTEND_URL` set correctly in Render
* [ ] `VITE_API_URL` set correctly in Vercel
* [ ] Razorpay test payment working
* [ ] COD order working
* [ ] Admin login working
* [ ] Menu CRUD working
* [ ] Cloudinary image upload working
* [ ] Customer favorites working
* [ ] Order tracking working
* [ ] Delivery OTP working
* [ ] Invoice print working
* [ ] KOT print working
* [ ] Coupon apply working
* [ ] Admin seed secret removed after admin creation

---

## Important API Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Menu

```text
GET    /api/menu
POST   /api/menu
PUT    /api/menu/:id
DELETE /api/menu/:id
```

### Orders

```text
POST /api/orders
GET  /api/orders/:id
PUT  /api/orders/:id/status
```

### User

```text
GET /api/users/me
GET /api/users/:userId/orders
PUT /api/users/:userId/favorites/:itemId
```

### Upload

```text
POST /api/upload/menu-image
```

### Admin

```text
POST /api/admin/seed-admin
GET  /api/admin/dashboard
```

---

## Future Improvements

* Customer profile page
* Saved delivery addresses
* Checkout auto-fill using saved address
* WhatsApp order notifications
* Better admin sales charts
* Customer reorder button improvements
* Push notifications
* More advanced inventory management
* Table QR ordering
* Kitchen display screen
* Multi-branch support
* Better analytics reports

---

## Author

**Henil Patel**

GitHub: https://github.com/henilpatel-codes

---

## License

This project is for learning, portfolio, and restaurant ordering system demonstration purposes.
