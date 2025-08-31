import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/auth'; 
import cartRoutes from './routes/cartRoutes';
import chatRoute from './routes/chat';
import collaborationRoutes from './routes/collaborationRoutes';
import cookieParser from 'cookie-parser'; 
import consultationRoutes from './routes/consultationRoutes';
import userRoutes from './routes/userRoutes';
dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:8080', 'https://qualitywoods.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
//Login/Signup
app.use('/api/auth', authRoutes); 
//Cart routes
app.use('/api/cart', cartRoutes);
//Collaboration Routes
app.use('/api/collaboration', collaborationRoutes);
// Chat route
app.use('/chat', chatRoute);
// To use the orders route
app.use('/api/orders', orderRoutes);
//Consultation
app.use('/api/consultation', consultationRoutes);
//self
app.use('/api/users', userRoutes);
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on http://localhost:5000'));
  })
  .catch((err) => console.error(err));
