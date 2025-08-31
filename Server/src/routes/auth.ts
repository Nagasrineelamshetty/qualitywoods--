import express from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../models/User';
import { Document } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Generate Access Token (short-lived)
const generateAccessToken = (user: IUser & Document): string => {
  return jwt.sign(
    { id: user._id, name: user.name, isAdmin: user.isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user: IUser & Document): string => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const typedUser = user as IUser & Document;

    const accessToken = generateAccessToken(typedUser);
    const refreshToken = generateRefreshToken(typedUser);

    // Cookie settings for localhost
    const isProduction = process.env.NODE_ENV === 'production';

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: isProduction,                     // ✅ true in production, false locally
  sameSite: isProduction ? 'none' : 'lax', // ✅ 'none' for cross-origin HTTPS, 'lax' locally
  maxAge: rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000,
});


    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        _id: typedUser._id,
        name: typedUser.name,
        email: typedUser.email,
        isAdmin: typedUser.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.token || req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, async (err: VerifyErrors | null, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    try {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const typedUser = user as IUser & Document;
      const newAccessToken = generateAccessToken(typedUser);

      res.json({
        accessToken: newAccessToken,
        user: {
          _id: typedUser._id,
          name: typedUser.name,
          email: typedUser.email,
          isAdmin: typedUser.isAdmin,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to refresh token', error });
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user with this email' });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save(); // Save hashed token & expiry to DB

    // Create reset URL (frontend page)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Quality Woods" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link valid for 1 hour.</p>`,
    });

    res.status(200).json({ message: 'Reset email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email', error });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token to compare with DB
    const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password & clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
});


export default router;
