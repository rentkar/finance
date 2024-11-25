import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://admin:admin@rentkar01.fsknlky.mongodb.net/payment_tracker?retryWrites=true&w=majority';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}