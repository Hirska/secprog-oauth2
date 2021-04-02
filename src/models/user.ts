import mongoose from 'mongoose';
import { DocumentUser } from '../types';
mongoose.set('useFindAndModify', false);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
});

export default mongoose.model<DocumentUser>('User', userSchema);
