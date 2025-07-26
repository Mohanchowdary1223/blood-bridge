import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonorStackData extends Document {
  userId: mongoose.Types.ObjectId;
  recipientName: string;
  donationDate: string;
  location: string;
  bloodType: string;
  units: number;
  recipientAge?: number;
  recipientGender?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'scheduled';
  createdAt: Date;
  updatedAt: Date;
}

const DonorStackDataSchema: Schema<IDonorStackData> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipientName: { type: String, required: true },
  donationDate: { type: String, required: true },
  location: { type: String, required: true },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true },
  recipientAge: { type: Number },
  recipientGender: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['completed', 'pending', 'scheduled'], required: true },
}, {
  timestamps: true
});

const DonorStackData: Model<IDonorStackData> = mongoose.models.DonorStackData || mongoose.model<IDonorStackData>('DonorStackData', DonorStackDataSchema);

export default DonorStackData; 