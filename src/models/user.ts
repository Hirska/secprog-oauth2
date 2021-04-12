import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import { DocumentUser } from '../types';
mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

userSchema.pre<DocumentUser>('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  if (!user.isModified('password')) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

export default mongoose.model<DocumentUser>('User', userSchema);
