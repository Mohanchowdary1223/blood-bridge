import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlockedUser extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  roleBeforeBlock: 'user' | 'donor';
  reason?: string;
  unblockRequests?: { message: string; date: Date }[];
}

const BlockedUserSchema: Schema<IBlockedUser> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  roleBeforeBlock: { type: String, enum: ['user', 'donor'], required: true },
  reason: { type: String },
  unblockRequests: [
    {
      message: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});

const BlockedUser: Model<IBlockedUser> = mongoose.models.BlockedUser || mongoose.model<IBlockedUser>('BlockedUser', BlockedUserSchema);

export default BlockedUser;
