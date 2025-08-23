import mongoose, { Document, Schema } from 'mongoose';

interface IItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizations?: {
    wood?: string;
    finish?: string;
    dimensions?: string;
  };
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  razorpayOrderId?: string;  // Optional for COD
  items: IItem[];
  status: 'Received' | 'In Production' | 'Shipped' | 'Delivered';
  total: number;
  estimatedDelivery?: Date;
  orderDate: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, required: false }, // Not mandatory now
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        customizations: {
          wood: { type: String },
          finish: { type: String },
          dimensions: { type: String },
        },
      },
    ],
    status: {
      type: String,
      enum: ['Received', 'In Production', 'Shipped', 'Delivered'],
      default: 'Received',
    },
    total: { type: Number, required: true },
    estimatedDelivery: { type: Date }, // Can be optional
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
