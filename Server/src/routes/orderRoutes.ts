import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import Order from '../models/Order';
import Product from '../models/Product'; 
import dotenv from 'dotenv';
import { verifyToken } from '../middleware/authmiddleware';
import { verifyAdmin } from '../middleware/adminmiddleware';

dotenv.config();
const router = express.Router();

/* -----------------------
   Razorpay instance
----------------------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

/* -----------------------
   Email transporter
----------------------- */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* -----------------------
   Calculate Total SECURELY
----------------------- */
const calculateTotalFromDB = async (items: any[]) => {
  let total = 0;

  for (const item of items) {
    const product = await Product.findById(item._id || item.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    total += product.price * item.quantity;
  }

  return total;
};

/* -----------------------
   Normalize Items
----------------------- */
const normalizeItems = async (items: any[]) => {
  const formattedItems = [];

  for (const item of items) {
    const product = await Product.findById(item._id || item.productId);

    if (!product) {
      throw new Error('Product not found');
    }

    formattedItems.push({
      productId: product._id,
      name: product.name,
      price: product.price, // 🔥 price from DB
      quantity: item.quantity,
      image: product.image,
      customizations: item.customizations || {},
    });
  }

  return formattedItems;
};

/* -----------------------
   Send confirmation email
----------------------- */
const sendOrderEmail = async (
  email: string,
  orderId: string,
  total: number
) => {
  if (!email) return;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    text: `Your order ${orderId} has been placed successfully. Total Amount: ₹${total}`,
  });
};

/* =========================================================
   CREATE RAZORPAY ORDER (SECURE)
========================================================= */
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    const total = await calculateTotalFromDB(items);

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    res.json({
      id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message,
    });
  }
});

/* =========================================================
   SAVE ORDER (COD) - SECURE
========================================================= */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, items, email } = req.body;

    if (!userId || !items) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const total = await calculateTotalFromDB(items);
    const formattedItems = await normalizeItems(items);

    const order = new Order({
      user: userId,
      items: formattedItems,
      total,
      razorpayOrderId: `COD-${Date.now()}`,
      status: 'Received',
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    await order.save();
    await sendOrderEmail(email, order.razorpayOrderId!, total);

    res.status(201).json({ message: 'Order saved successfully', order });

  } catch (error: any) {
    console.error('Error saving order:', error);
    res.status(500).json({
      message: 'Failed to save order',
      error: error.message,
    });
  }
});

/* =========================================================
   VERIFY RAZORPAY PAYMENT - SECURE
========================================================= */
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      items,
      email,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: 'Missing Razorpay payment details',
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET as string)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: 'Payment verification failed',
      });
    }

    // 🔥 Recalculate again (never trust frontend total)
    const total = await calculateTotalFromDB(items);
    const formattedItems = await normalizeItems(items);

    const order = new Order({
      user: userId,
      items: formattedItems,
      total,
      razorpayOrderId: razorpay_order_id,
      status: 'Received',
      estimatedDelivery: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ),
    });

    await order.save();
    await sendOrderEmail(email, razorpay_order_id, total);

    res.status(201).json({
      message: 'Payment verified & order saved',
      order,
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      message: 'Payment verification failed',
      error: error.message,
    });
  }
});
/* =========================================================
   GET ORDERS FOR USER
========================================================= */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      message: 'Failed to fetch user orders',
      error: error.message,
    });
  }
});
export default router;