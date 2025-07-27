import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohanchowdary963:mohan123@bloodbridge.puxw39h.mongodb.net/bloodbridge?retryWrites=true&w=majority&appName=BloodBridge';

export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState >= 1) return;
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

// Alias for backward compatibility
export const connectMongo = connectToDatabase; 