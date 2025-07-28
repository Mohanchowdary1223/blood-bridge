
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'user' | 'donor' | 'admin' | 'blocked';
  signupReason?: string;
  dateOfBirth?: string;
  canUpdateToDonor?: boolean;
  profileUpdatableAt?: Date | null;
  healthDetails?: string;
  currentAge?: number;
  bloodType?: string;
  isAdmin(): boolean;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'donor', 'admin', 'blocked'], required: true },
  signupReason: { type: String },
  dateOfBirth: { type: String },
  canUpdateToDonor: { type: Boolean, default: false },
  profileUpdatableAt: { type: Date, default: null },
  healthDetails: { type: String },
  currentAge: { type: Number },
  bloodType: { type: String },
});

// Add method to check if user is admin
UserSchema.methods.isAdmin = function(): boolean {
  return this.role === 'admin';
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User; 