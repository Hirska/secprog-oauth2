import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import settings from './settings';
import { JWTData } from '../types';

const JWT_SECRET = settings.JWT_SECRET;
const JWT_EXPIRATION = settings.JWT_LIFETIME;

export const randomBytesAsync = (size = 64): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (ex, buffer) => {
      if (ex) {
        reject('Error generating token');
      }
      resolve(buffer);
    });
  });
};

export const createSHA256Hash = (payload: string | Buffer) => {
  return crypto.createHash('sha256').update(payload).digest('hex');
};

export const generateJwt = (payload: JWTData) => {
  const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  return { access_token, expires_in: JWT_EXPIRATION };
};
