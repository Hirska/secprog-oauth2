import mongoose from 'mongoose';
import { DocumentCode } from '../types';
mongoose.set('useFindAndModify', false);

const codeSchema = new mongoose.Schema({
  code: { type: String, required: true },
  redirectUri: { type: String },
  expiresAt: { type: Number, required: true },
  clientId: { type: String, required: true },
  scopes: { type: Array },
  user: { type: String, required: true },
  codeChallenge: { type: String },
  codeChallengeMethod: { type: String }
});

export default mongoose.model<DocumentCode>('Code', codeSchema);
