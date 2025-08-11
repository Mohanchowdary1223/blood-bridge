import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: Types.ObjectId | string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  originalSharedId?: string | null;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  text: { type: String, required: true },
  sender: { type: String, enum: ['user', 'bot'], required: true },
  timestamp: { type: Date, required: true },
});

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: Schema.Types.Mixed, required: true, index: true },
  title: { type: String, required: true },
  messages: { type: [MessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  originalSharedId: { type: String, default: null, index: true },
});

export default mongoose.models.UsersChatHistory || mongoose.model<IChatSession>('UsersChatHistory', ChatSessionSchema); 