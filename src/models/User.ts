
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'user' | 'donor';
  signupReason?: string;
  dateOfBirth?: string;
  canUpdateToDonor?: boolean;
  profileUpdatableAt?: Date | null;
  // New fields for different profile types
  healthDetails?: string;
  currentAge?: number;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'donor'], required: true },
  signupReason: { type: String },
  dateOfBirth: { type: String },
  canUpdateToDonor: { type: Boolean, default: false },
  profileUpdatableAt: { type: Date, default: null },
  // New fields for different profile types
  healthDetails: { type: String },
  currentAge: { type: Number },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User; 