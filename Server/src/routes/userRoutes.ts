// routes/userRoutes.ts
import express from 'express';
import User from '../models/User';
import { verifyToken, AuthenticatedRequest } from '../middleware/authmiddleware';

const router = express.Router();

// GET /api/users/me → get logged-in user
router.get('/me', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'User not found on request' });

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
