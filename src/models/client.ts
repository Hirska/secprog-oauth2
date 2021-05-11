import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { DocumentClient } from '../types';
import { v4 as uuidv4 } from 'uuid';
mongoose.set('useFindAndModify', false);

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redirectUris: { type: Array, required: true },
  clientId: { type: String },
  clientName: { type: String, required: true },
  isConfidential: { type: Boolean, required: true },
  clientSecret: { type: String }
});

clientSchema.pre<DocumentClient>('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const client = this;
  //TODO: Disable clientSecret from public clients
  if (!client.isModified('clientSecret')) return next();
  if (client.isConfidential && client.clientSecret) {
    client.clientSecret = await bcrypt.hash(client.clientSecret, 10);
  }

  return next();
});

clientSchema.pre<DocumentClient>('save', function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const client = this;
  client.clientId = uuidv4();
  next();
});

export default mongoose.model<DocumentClient>('Client', clientSchema);
