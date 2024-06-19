import mongoose from 'mongoose';
import dbConnect from './dbConnect';

const clientPromise = dbConnect().then((mongoose) => {
  if (!mongoose.connection) {
    throw new Error('Failed to connect to database');
  }
  return mongoose.connection.getClient();
});

export default clientPromise;
