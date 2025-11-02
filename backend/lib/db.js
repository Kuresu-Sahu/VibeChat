import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * Appends `/chat-app` database name to the provided URI by convention.
 * Exits the process on connection failure.
 */
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};