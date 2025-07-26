import { Schema, Document, models, model } from 'mongoose';

export interface INotification extends Document {
  type: 'vote' | 'report';
  title: string;
  description: string;
  sender: string; // userId or name
  senderAvatar?: string;
  receiver: string; // userId or name
  timestamp: Date;
  status: 'read' | 'unread';
  priority: 'low' | 'medium' | 'high';
  content?: string;
  isStarred?: boolean;
}

const NotificationSchema = new Schema<INotification>({
  type: { type: String, enum: ['vote', 'report'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  sender: { type: String, required: true },
  senderAvatar: { type: String },
  receiver: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['read', 'unread'], default: 'unread' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  content: { type: String },
  isStarred: { type: Boolean, default: false },
});

export default models.Notification || model<INotification>('Notification', NotificationSchema);
