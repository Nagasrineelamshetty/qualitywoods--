import express from 'express';
import Consultation from '../models/Consultation';
import { verifyToken, AuthenticatedRequest } from '../middleware/authmiddleware';

const router = express.Router();

// POST /api/consultation
router.post('/', verifyToken, async (req: AuthenticatedRequest, res) => {
  const { name, email, phone, date, time } = req.body;

  if (!name || !email || !phone || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const consultation = await Consultation.create({
      name,
      email,
      phone,
      date,
      time
    });

    res.status(201).json({ message: 'Consultation request received', consultation });
  } catch (error: any) {
    console.error('Consultation creation error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create consultation', error: error.message });
  }
});

export default router;
