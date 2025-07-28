import mongoose from 'mongoose';

const MasterNotificationSchema = new mongoose.Schema({
  notification: { type: Object, required: true },
});

export default mongoose.models.MasterNotification || mongoose.model('MasterNotification', MasterNotificationSchema);
