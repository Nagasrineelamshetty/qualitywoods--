import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import orderRoutes from './routes/orderRoutes'; // ✅ <-- added this
import auth from './routes/auth'; 
import cartRoutes from './routes/cartRoutes';
import chatRoute from './routes/chat';
import collaborationRoutes from './routes/collaborationRoutes';


dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:8080', 'https://qualitywoods.vercel.app'],
  credentials: true
}));
app.use(express.json());
//Login/Signup
app.use('/api/users', auth); 
//cart routes
app.use('/api/cart', cartRoutes);
app.use('/api/collab', collaborationRoutes);
// 🔁 chat route
app.use('/chat', chatRoute);

// ✅ Add this line to use the orders route
app.use('/api/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on http://localhost:5000'));
  })
  .catch((err) => console.error(err));
