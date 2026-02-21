# 🪵 QualityWoods – Full Stack Custom Furniture E-Commerce Platform

QualityWoods is a production-ready full-stack custom furniture e-commerce application that allows users to explore furniture collections, customize products, schedule consultations, place secure online orders, and track deliveries in real time.

The platform includes a fully functional Admin Dashboard for managing products, consultations, orders, delivery status, and sales analytics.

Frontend is deployed on **Vercel** and Backend is deployed on **Render**.

Link: https://qualitywoods.vercel.app/

# 🚀 Core Features

---

## 🏠 1. Homepage

- Hero section with:
  - 🛍 **Shop Now**
  - 📅 **Schedule Consultation**

---

## About Us section:
  - Workshop address
  - Directions
  - Testimonials
  - Why Choose Us section
  - Fully responsive modern UI

---

## 🛍 2. Products Section

- View all available products
- Product categories:
  - Sofas
  - Office 
  - Storage
  - Beds
  - Dining Tables
- Individual product details page
- Add to Cart
- Buy Now functionality

---

## 🛒 3. Cart System

- Add products to cart
- Remove products from cart
- Update quantity
- Persistent cart state
- Dynamic total calculation
- GST and shipping calculation

---

## 💳 4. Secure Payment System

### Payment Options:
- Razorpay (UPI / Cards / Net Banking)
- Cash on Delivery (COD)

### Security Architecture:
- Backend recalculates total amount
- Product prices fetched securely from database
- Razorpay signature verification
- Order saved only after successful verification

---

## 📦 5. Orders & Tracking

- Users can view all placed orders
- Order details include:
  - Total amount
  - Order date
  - Estimated delivery
- Real-time order status tracking:
  - Received
  - In Production
  - Shipped
  - Delivered
- Visual progress bar for tracking

---

## 🔐 6. Authentication System

- User Registration
- User Login
- JWT Authentication
- Access & Refresh Token mechanism
- Forgot Password functionality
- Protected routes
- Role-based access (Admin / User)

---

## 📅 7. Consultation Booking

- Users can schedule consultations
- Admin can:
  - View consultations
  - Manage consultation requests

---

# 👑 Admin Dashboard

Admin Panel includes:

### 📊 Analytics Dashboard
- Total revenue
- Total orders
- Sales overview
- Basic analytics visualization

### 🛠 Product Management
- Upload new products
- Edit products
- Delete products
- Update product details
- Update product categories

### 🚚 Order Management
- View all orders
- Update order delivery status
- Manage order lifecycle

### 📞 Consultation Management
- View scheduled consultations
- Manage customer requests

---

# 🏗 Tech Stack

---

## 🖥 Frontend (Client)

- React (Vite)
- TypeScript
- Tailwind CSS
- Axios (Custom Instance)
- React Router
- Context API (Auth & Cart)
- Lucide Icons

Deployed on: **Vercel**

---

## ⚙ Backend (Server)

- Node.js
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT Authentication
- Razorpay API
- Nodemailer (Email confirmation)
- Secure payment verification

Deployed on: **Render**

---

# 📂 Project Folder Structure

```
qualitywoods/
│
├── Client/                          # Frontend (React + Vite + TypeScript)
│   ├── dist/                        # Production build
│   ├── node_modules/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── pages/                   # Home, Products, Cart, Orders, Admin
│   │   ├── components/              # Reusable UI components
│   │   ├── contexts/                # AuthContext, CartContext
│   │   ├── api/                     # Axios instance
│   │   ├── hooks/                   # Custom hooks
│   │   └── main.tsx                 # Entry file
│   │
│   ├── .env                         # Frontend environment variables
│   ├── components.json              # UI configuration
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vercel.json                  # Vercel deployment config
│   └── vite.config.ts
│
├── Server/                          # Backend (Node + Express + TypeScript)
│   ├── node_modules/
│   ├── src/
│   │   ├── middleware/              # Auth middleware, Admin middleware
│   │   ├── models/                  # User, Product, Order, Consultation
│   │   ├── routes/                  # Auth, Orders, Products, Admin
│   │   ├── types/                   # Custom TypeScript types
│   │   ├── utils/                   # Helper functions
│   │   ├── express.d.ts             # Express type extension
│   │   ├── knowledge.txt
│   │   └── server.ts                # Backend entry point
│   │
│   ├── uploads/                     # Uploaded product images
│   ├── .env                         # Backend environment variables
│   ├── package.json
│   ├── package-lock.json
│   ├── sampleenv.txt
│   └── tsconfig.json
│
└── README.md
```



# ⚙ Installation & Setup (Local Development)

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/qualitywoods.git
cd qualitywoods
```

---

## 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password@...
JWT_SECRET=superstrongsecretkey
OPENAI_API_KEY=openai_api_key
RAZORPAY_KEY_ID=yourkeyid
RAZORPAY_SECRET=yoursecret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mailid
EMAIL_PASS=password

```

Start backend:

```bash
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd client
npm install
```

Create `.env` file inside `client/`:

```env
VITE_RAZORPAY_KEY_ID=key_id
VITE_API_URL=http://localhost:5000 
```

Start frontend:

```bash
npm run dev
```

---

# 🧠 Engineering Concepts Implemented

- Full-stack architecture
- REST API design
- Secure payment verification
- Server-side price validation
- Token-based authentication
- Role-based access control
- Context API state management
- Production deployment (Vercel + Render)
- MongoDB data modeling
- Order lifecycle management

---

# 🎯 Future Improvements

- Razorpay Webhook integration
- Advanced sales analytics
- Inventory management system
- Email notifications for status updates
- Coupon & discount system
- Image optimization & CDN support

---

# 👩‍💻 Developed By

**Nagasri**  
Full Stack Developer   

---

# ⭐ Support

If you like this project, feel free to star the repository!

---

