import mongoose, { Schema, Document, Model } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  description: string;   // 👈 all specs go here
  price: number;
  image: string;
  category: string;
  isInStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    isInStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Product: Model<ProductDocument> =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>("Product", productSchema);

export default Product;
