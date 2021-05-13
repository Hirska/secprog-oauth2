import mongoose from 'mongoose';
import setup from './setup';
import settings from './utils/settings';

const MONGODB_URI = settings.MONGODB_URI;

export const connectToDB = () => {
  mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
      console.log('connected to MongoDb');
      setup()
        .then(() => console.log('Setup finished'))
        .catch((error) => console.log(error));
    })
    .catch((error) => {
      console.log('error connection to MongoDB:', error.message);
    });
};
