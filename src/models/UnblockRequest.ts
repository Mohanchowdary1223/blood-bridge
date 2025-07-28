import mongoose, { Schema, Document } from 'mongoose';

export interface IUnblockRequest extends Document {
  userId: string;
  userName: string;
  userEmail: string;
  message: string;
  date: Date;
  blockedReason: string;
  status: 'blocked' | 'unblocked';
}

const UnblockRequestSchema: Schema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  blockedReason: { type: String, required: true },
  status: { type: String, enum: ['blocked', 'unblocked'], default: 'blocked' },
});

export default mongoose.models.UnblockRequest || mongoose.model<IUnblockRequest>('UnblockRequest', UnblockRequestSchema);
