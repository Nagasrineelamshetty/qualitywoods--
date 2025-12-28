import mongoose, { Schema, Document } from "mongoose";

export interface IConsultation extends Document {
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: string;
  contacted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    contacted: { type: Boolean, default: false }

  },
  {
    timestamps: true, 
  }
);

export default mongoose.model<IConsultation>(
  "Consultation",
  ConsultationSchema
);
