import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonor extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  phone: string;
  bloodType: string;
  dob: string;
  gender: string;
  weight: string;
  height: string;
  country: string;
  state: string;
  city: string;
  isAvailable: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema: Schema<IDonor> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  bloodType: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  weight: { type: String, required: true },
  height: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  isAvailable: { type: Boolean, default: null },
}, {
  timestamps: true
});

const Donor: Model<IDonor> = mongoose.models.Donor || mongoose.model<IDonor>('Donor', DonorSchema);

export default Donor; 