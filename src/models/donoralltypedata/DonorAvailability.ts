import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonorAvailability extends Document {
  userId: mongoose.Types.ObjectId;
  isAvailable: boolean;
  availableDate?: string; // ISO date string for when the user will be available
  updatedAt: Date;
}

const DonorAvailabilitySchema: Schema<IDonorAvailability> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  isAvailable: { type: Boolean, required: true },
  availableDate: { type: String },
}, {
  timestamps: { createdAt: false, updatedAt: true }
});

const DonorAvailability: Model<IDonorAvailability> = mongoose.models.DonorAvailability || mongoose.model<IDonorAvailability>('DonorAvailability', DonorAvailabilitySchema);

export default DonorAvailability;
