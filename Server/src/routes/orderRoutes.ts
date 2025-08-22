import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Order from '../models/Order';
import { sendOrderConfirmationEmail } from '../utils/mailer'; // ✅ Added email utility

const router = express.Router();

// ✅ POST /api/orders/create-order — Create Razorpay order
router.post(
  '/create-order',
  asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;

    if (!amount) {
      res.status(400).json({ message: 'Amount is required' });
      return;
    }

    const Razorpay = require('razorpay');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_SECRET!,
    });

    const order = await instance.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    });

    res.status(201).json(order);
  })
);

// ✅ POST /api/orders — Save order after payment
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      user: userId,
      email,
      items,
      total,
      razorpayOrderId,
      status,
      estimatedDelivery,
    } = req.body;

    if (!userId || !items || !total || !razorpayOrderId) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const order = new Order({
      user: userId,
      items,
      total,
      razorpayOrderId,
      status: status || 'Received',
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    // ✅ Send confirmation email
    const userEmail = email || 'customer@example.com';
    await sendOrderConfirmationEmail(userEmail, razorpayOrderId);

    res.status(201).json({ message: 'Order saved and confirmation email sent' });
  })
);

// ✅ GET /api/orders/:orderId — Get order by Razorpay payment ID
router.get(
  '/:orderId',
  asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findOne({ razorpayOrderId: req.params.orderId });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json(order);
  })
);

// ✅ GET /api/orders/user/:userId — Get all orders for a user
router.get(
  '/user/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  })
);

// ✅ POST /api/orders/verify-payment — Verify Razorpay signature and save order
router.post(
  '/verify-payment',
  asyncHandler(async (req: Request, res: Response) => {
    const crypto = require('crypto');
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      user,
      email,
      items,
      total,
      shippingInfo,
    } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: 'Invalid Razorpay signature' });
      return;
    }

    const order = new Order({
      user,
      email,
      items,
      total,
      razorpayOrderId: razorpay_order_id,
      status: 'Paid',
      shippingInfo,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();
    await sendOrderConfirmationEmail(email, razorpay_order_id);

    res.status(201).json({ message: 'Payment verified and order saved' });
  })
);


export default router;
