import mongoose from 'mongoose';

const UserNotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  notification: { type: Object, required: true },
});

export default mongoose.models.UserNotification || mongoose.model('UserNotification', UserNotificationSchema);
