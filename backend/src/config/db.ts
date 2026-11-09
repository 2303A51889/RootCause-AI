import mongoose from 'mongoose';

export async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing. Set your MongoDB Atlas connection string in the environment.');
    }

    mongoose.set('bufferCommands', false);
    await mongoose.connect(mongoUri);
    console.log('✔️ MongoDB connected');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}
