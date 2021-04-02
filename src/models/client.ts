import mongoose from 'mongoose';
import { DocumentClient } from '../types';
mongoose.set('useFindAndModify', false);

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redirectUris: { type: Array, required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String },
  grants: { type: Array }
});

export default mongoose.model<DocumentClient>('Client', clientSchema);
