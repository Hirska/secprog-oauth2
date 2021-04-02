import mongoose from 'mongoose';
import { ICode } from '../types';
mongoose.set('useFindAndModify', false);

const codeSchema = new mongoose.Schema({
  authorizationCode: { type: String, required: true },
  redirectUri: { type: String },
  lifetime: { type: Number, required: true },
  clientId: { type: String, required: true },
  scope: { type: String }
});

export default mongoose.model<ICode>('Code', codeSchema);
