import mongoose from 'mongoose';

const AdminSendReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  reportId: { type: String },
  sentAt: { type: Date, default: Date.now },
});

export default mongoose.models.AdminSendReport || mongoose.model('AdminSendReport', AdminSendReportSchema);
