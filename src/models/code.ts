import mongoose from 'mongoose';
import { ICode } from '../types';
mongoose.set('useFindAndModify', false);

const codeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  redirectUrl: { type: String },
  expiresAt: { type: Number, required: true },
  clientId: { type: String, required: true },
  scopes: { type: Array },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model<ICode>('Code', codeSchema);
