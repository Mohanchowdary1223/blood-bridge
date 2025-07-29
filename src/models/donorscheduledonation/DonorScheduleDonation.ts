import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDonorScheduleDonation extends Document {
  userId: Types.ObjectId;
  scheduledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DonorScheduleDonationSchema = new Schema<IDonorScheduleDonation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  scheduledDate: { type: Date, required: true },
}, {
  timestamps: true
});

export default mongoose.models.DonorScheduleDonation || mongoose.model<IDonorScheduleDonation>('DonorScheduleDonation', DonorScheduleDonationSchema);
