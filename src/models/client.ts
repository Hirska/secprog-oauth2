import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { DocumentClient } from '../types';
mongoose.set('useFindAndModify', false);

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redirectUrls: { type: Array, required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String },
  isConfidential: { type: Boolean, required: true },
  grants: { type: Array }
});

clientSchema.pre<DocumentClient>('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const client = this;
  if (!client.isModified('clientSecret')) return next();
  if (!client.clientSecret) return next();
  client.clientSecret = await bcrypt.hash(client.clientSecret, 10);
  next();
});

export default mongoose.model<DocumentClient>('Client', clientSchema);
