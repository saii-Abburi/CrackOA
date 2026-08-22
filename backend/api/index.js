import app from '../src/app.js';
import connectDB from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB in serverless handler:', error);
  }
  return app(req, res);
}
