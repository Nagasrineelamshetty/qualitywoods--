// routes/collaborationRoutes.ts
import express, { Request, Response } from 'express';
import crypto from 'crypto';
import Collaboration from '../models/Collaboration';
import { verifyToken as requireAuth } from '../middleware/authmiddleware'; // your JWT middleware
import { AuthRequest } from '../types/AuthRequest';
const router = express.Router();

/**
 * Create a new collaborative session
 * POST /api/collaboration/create
 * Body: optional initialItems: ICartItem[]
 * Returns: { sessionId }
 */
router.post('/create', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    // generate short unique sessionId (16 hex chars)
    const sessionId = crypto.randomBytes(8).toString('hex');

    const initialItems = Array.isArray(req.body.initialItems) ? req.body.initialItems : [];

    const session = await Collaboration.create({
      sessionId,
      users: [userId],
      cartItems: initialItems,
      createdAt: new Date()
    });

    return res.json({ sessionId });
  } catch (err: any) {
    console.error('Create session error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Join a session (adds the logged-in user to session users)
 * POST /api/collaboration/join
 * Body: { sessionId }
 * Returns: { message, session }
 */
router.post('/join', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (!session.users.includes(userId)) {
      session.users.push(userId);
      await session.save();
    }

    return res.json({ message: 'Joined session', session });
  } catch (err: any) {
    console.error('Join session error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Get a session (only participants allowed)
 * GET /api/collaboration/:sessionId
 * Returns: session document
 */
router.get('/:sessionId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (!session.users.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant of this session' });
    }

    return res.json(session);
  } catch (err: any) {
    console.error('Get session error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Add an item to the session cart (or increase quantity if exists)
 * POST /api/collaboration/add-item
 * Body: { sessionId, productId, name, price, quantity (optional, default 1) }
 * Returns: { message, session }
 */
router.post('/add-item', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId, productId, name, price, quantity = 1 } = req.body;
    if (!sessionId || !productId || !name || typeof price !== 'number') {
      return res.status(400).json({ error: 'sessionId, productId, name and price required' });
    }

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.users.includes(userId)) return res.status(403).json({ error: 'Not a participant' });

    const existing = session.cartItems.find(ci => ci.productId === productId);
    if (existing) {
      existing.quantity = (existing.quantity || 0) + Number(quantity);
    } else {
      session.cartItems.push({
        productId,
        name,
        price,
        quantity: Number(quantity),
        votes: [],
        comments: []
      } as any);
    }

    await session.save();
    return res.json({ message: 'Item added', session });
  } catch (err: any) {
    console.error('Add item error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Update item quantity (set exact number or remove if 0)
 * POST /api/collaboration/update-quantity
 * Body: { sessionId, productId, quantity }
 * Returns: { message, session }
 */
router.post('/update-quantity', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId, productId, quantity } = req.body;
    if (!sessionId || !productId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'sessionId, productId and numeric quantity required' });
    }

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.users.includes(userId)) return res.status(403).json({ error: 'Not a participant' });

    const itemIndex = session.cartItems.findIndex(ci => ci.productId === productId);
    if (itemIndex === -1) return res.status(400).json({ error: 'Item not found in session' });

    if (quantity <= 0) {
      // remove item
      session.cartItems.splice(itemIndex, 1);
    } else {
      session.cartItems[itemIndex].quantity = quantity;
    }

    await session.save();
    return res.json({ message: 'Quantity updated', session });
  } catch (err: any) {
    console.error('Update quantity error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Vote on an item (toggle/change)
 * POST /api/collaboration/vote
 * Body: { sessionId, productId, voteType } // voteType: 'up' | 'down'
 * Returns: { session }
 */
router.post('/vote', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId, productId, voteType } = req.body;
    if (!sessionId || !productId || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'sessionId, productId and voteType(up/down) required' });
    }

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.users.includes(userId)) return res.status(403).json({ error: 'Not a participant' });

    const item = session.cartItems.find(ci => ci.productId === productId);
    if (!item) return res.status(400).json({ error: 'Item not found in session' });

    const existing = item.votes.find(v => v.userId === userId);
    const newValue = voteType === 'up' ? 1 : -1;

    if (!existing) {
      item.votes.push({ userId, value: newValue } as any);
    } else if (existing.value === newValue) {
      // toggle off
      item.votes = item.votes.filter(v => v.userId !== userId);
    } else {
      // change vote
      existing.value = newValue;
    }

    await session.save();
    return res.json({ session });
  } catch (err: any) {
    console.error('Vote error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Add a comment to an item
 * POST /api/collaboration/comment
 * Body: { sessionId, productId, text }
 * Returns: { session }
 */
router.post('/comment', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const userName = (req.user!.name || 'Unknown').toString();
    const { sessionId, productId, text } = req.body;
    if (!sessionId || !productId || !text || typeof text !== 'string') {
      return res.status(400).json({ error: 'sessionId, productId and text required' });
    }

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.users.includes(userId)) return res.status(403).json({ error: 'Not a participant' });

    const item = session.cartItems.find(ci => ci.productId === productId);
    if (!item) return res.status(400).json({ error: 'Item not found in session' });

    item.comments.push({ userId, text, timestamp: new Date() } as any);

    await session.save();
    return res.json({ session });
  } catch (err: any) {
    console.error('Comment error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

/**
 * Session summary & split calculation
 * GET /api/collaboration/:sessionId/summary?numPeople=3
 * Returns: { totalPrice, numPeople, perPerson }
 */
router.get('/:sessionId/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    const numPeople = Number(req.query.numPeople) || 1;

    const session = await Collaboration.findOne({ sessionId });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.users.includes(userId)) return res.status(403).json({ error: 'Not a participant' });

    const totalPrice = session.cartItems.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
    const perPerson = numPeople > 0 ? +(totalPrice / numPeople).toFixed(2) : 0;

    return res.json({ totalPrice, numPeople, perPerson });
  } catch (err: any) {
    console.error('Summary error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
});

export default router;
