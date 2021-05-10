import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { DocumentClient } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { randomBytesAsync } from '../utils/utils';
mongoose.set('useFindAndModify', false);

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redirectUrls: { type: Array, required: true },
  clientId: { type: String, default: uuidv4() },
  clientName: { type: String },
  isConfidential: { type: Boolean, required: true },
  clientSecret: { type: String }
});

clientSchema.pre<DocumentClient>('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const client = this;
  //TODO: Disable clientSecret from public clients
  if (client.isConfidential) {
    const randomBytes = await randomBytesAsync(48);
    // Add logger for development mode
    console.log(`Client secret for ${client.clientName}: ${randomBytes}`);
    client.clientSecret = crypto.createHash('sha256').update(randomBytes).digest('hex');
    client.clientSecret = await bcrypt.hash(client.clientSecret, 10);
  }

  next();
});

export default mongoose.model<DocumentClient>('Client', clientSchema);
