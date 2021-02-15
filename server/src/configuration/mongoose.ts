import mongoose from 'mongoose';

import { MONGODB_URI } from './constants';

export const startMongoose = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('DB started');
  } catch (e) {
    console.log(e);
  }
};
