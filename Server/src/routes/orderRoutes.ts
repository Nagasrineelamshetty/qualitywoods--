// import express, { Request, Response } from 'express';
// import Razorpay from 'razorpay';
// import crypto from 'crypto';
// import nodemailer from 'nodemailer';
// import Order from '../models/Order';
// import dotenv from 'dotenv';
// dotenv.config();
// const router = express.Router();

// // Razorpay Instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID as string,
//   key_secret: process.env.RAZORPAY_SECRET as string, // ensure consistency
// });

// // Email Transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Send Confirmation Email
// const sendOrderEmail = async (email: string, orderId: string, total: number) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: `Order Confirmation - ${orderId}`,
//     text: `Your order ${orderId} has been placed successfully. Total Amount: ₹${total}`,
//   });
// };

// // Create Razorpay Order
// router.post('/create-order', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { amount } = req.body;
//     if (!amount) {
//       res.status(400).json({ message: 'Amount is required' });
//       return;
//     }

//     const options = { amount: amount * 100, currency: 'INR', receipt: `receipt_${Date.now()}` };
//     const order = await razorpay.orders.create(options);
//     res.json(order);
//   } catch (error: any) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ message: 'Failed to create order', error: error.message });
//   }
// });

// // Save Order After Payment or COD
// router.post('/', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { userId, items, total, razorpayOrderId, status, estimatedDelivery, email } = req.body;

//     if (!userId || !items || !total) {
//       res.status(400).json({ message: 'Missing required fields' });
//       return;
//     }

//     const order = new Order({
//       user: userId,
//       items,
//       total,
//       razorpayOrderId: razorpayOrderId || `COD-${Date.now()}`,
//       status: status || 'Received',
//       estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     });

//     await order.save();

//     if (email) await sendOrderEmail(email, order.razorpayOrderId!, total);

//     res.status(201).json({ message: 'Order saved successfully', order });
//   } catch (error: any) {
//     console.error('Error saving order:', error);
//     res.status(500).json({ message: 'Failed to save order', error: error.message });
//   }
// });

// // Verify Razorpay Payment
// router.post('/verify-payment', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userId,
//       items,
//       total,
//       email,
//       shippingInfo
//     } = req.body;

//     const body = razorpay_order_id + '|' + razorpay_payment_id;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_SECRET as string)
//       .update(body)
//       .digest('hex');

//     if (expectedSignature !== razorpay_signature) {
//       res.status(400).json({ message: 'Payment verification failed' });
//       return;
//     }

//     const order = new Order({
//       user: userId,
//       items,
//       total,
//       razorpayOrderId: razorpay_order_id,
//       status: 'Paid',
//       shippingInfo,
//       estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//     });

//     await order.save();

//     if (email) await sendOrderEmail(email, order.razorpayOrderId!, total);

//     res.status(201).json({ message: 'Payment verified & order saved', order });
//   } catch (error: any) {
//     console.error('Error verifying payment:', error);
//     res.status(500).json({ message: 'Payment verification failed', error: error.message });
//   }
// });

// // Get Orders for a User
// router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (error: any) {
//     console.error('Error fetching user orders:', error);
//     res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
//   }
// });

// export default router;
import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import Order from '../models/Order';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send confirmation email
const sendOrderEmail = async (email: string, orderId: string, total: number) => {
  if (!email) return;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${orderId}`,
    text: `Your order ${orderId} has been placed successfully. Total Amount: ₹${total}`,
  });
};

// -----------------------
// Create Razorpay Order
// -----------------------
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be > 0' });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// -----------------------
// Save Order (COD or manual save)
// -----------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, items, total, razorpayOrderId, status, estimatedDelivery, email } = req.body;

    if (!userId || !items || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const order = new Order({
      user: userId,
      items,
      total,
      razorpayOrderId: razorpayOrderId || `COD-${Date.now()}`,
      status: status || 'Received',
      estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    await sendOrderEmail(email, order.razorpayOrderId!, total);

    res.status(201).json({ message: 'Order saved successfully', order });
  } catch (error: any) {
    console.error('Error saving order:', error);
    res.status(500).json({ message: 'Failed to save order', error: error.message });
  }
});

// -----------------------
// Verify Razorpay Payment
// -----------------------
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      items,
      total,
      email,
      shippingInfo,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing Razorpay payment details' });
    }

    // Create signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET as string)
      .update(body)
      .digest('hex');

    console.log('Received signature:', razorpay_signature);
    console.log('Expected signature:', expectedSignature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const order = new Order({
      user: userId,
      items,
      total,
      razorpayOrderId: razorpay_order_id,
      status: 'Received',
      shippingInfo,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await order.save();

    await sendOrderEmail(email, order.razorpayOrderId!, total);

    res.status(201).json({ message: 'Payment verified & order saved', order });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// -----------------------
// Get Orders for a User
// -----------------------
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
});

export default router;
