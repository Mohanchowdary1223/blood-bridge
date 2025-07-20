import mongoose from 'mongoose';

// Hardcoded MongoDB URI for the 'bloodbank' database
const MONGODB_URI = 'mongodb://localhost:27017/bloodbank';

export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(MONGODB_URI);
} 