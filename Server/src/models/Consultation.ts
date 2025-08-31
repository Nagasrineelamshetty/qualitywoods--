import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  name: string;
  email: string;
  phone: string;
  date: string;      // or Date type if you want
  timeFrom: string;
  timeTo: string;
  createdAt: Date;
}

const ConsultationSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },        // or Date type
  timeFrom: { type: String, required: true },
  timeTo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IConsultation>('Consultation', ConsultationSchema);
