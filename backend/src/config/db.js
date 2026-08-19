import dns from 'node:dns';
import mongoose from 'mongoose';
import env from './env.js';

// Configure fallback public DNS servers to prevent Windows querySrv ECONNREFUSED issues on mongodb+srv
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS setting fails
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  console.log('Connecting to MongoDB...');
  console.log('URI:', env.MONGODB_URI?.substring(0, 15) + '...'); // Log first 15 chars

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // These options are defaults in mongoose 8 but kept for clarity
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

export default connectDB;
