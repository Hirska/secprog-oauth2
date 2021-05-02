import { promisify } from 'util';
import crypto from 'crypto';

export const randomBytesAsync = promisify(crypto.randomBytes);
