import mongoose, { Schema, Document } from "mongoose";

interface IVote {
  userId: string;
  value: number; // 1 for upvote, -1 for downvote
}

interface IComment {
  userId: string;
  text: string;
  timestamp: Date;
}

interface ICartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  votes: IVote[];
  comments: IComment[];
}

export interface ICollaboration extends Document {
  sessionId: string;
  users: string[]; // array of user IDs
  cartItems: ICartItem[];
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>({
  userId: { type: String, required: true },
  value: { type: Number, required: true }
});

const CommentSchema = new Schema<IComment>({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  votes: [VoteSchema],
  comments: [CommentSchema]
});

const CollaborationSchema = new Schema<ICollaboration>({
  sessionId: { type: String, required: true, unique: true },
  users: [{ type: String, required: true }],
  cartItems: [CartItemSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICollaboration>(
  "Collaboration",
  CollaborationSchema
);
