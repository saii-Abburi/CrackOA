import mongoose from 'mongoose';
import env from './env.js';

let connPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (connPromise) {
    return connPromise;
  }

  console.log('Connecting to MongoDB...');
  console.log('URI:', env.MONGODB_URI ? env.MONGODB_URI.substring(0, 15) + '...' : 'Undefined');

  connPromise = mongoose
    .connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    .then((conn) => {
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      connPromise = null;
      console.error(`❌ MongoDB connection error: ${error.message}`);
      throw error;
    });

  return connPromise;
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

export default connectDB;
