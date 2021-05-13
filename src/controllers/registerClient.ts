import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import { ZodError } from 'zod';
import Client from '../models/client';
import { newClientSchema } from '../utils/parse';
import { createSHA256Hash, randomBytesAsync } from '../utils/utils';

export const registerClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientName, isConfidential, redirectUris } = newClientSchema.parse(req.body);
    const clientSecret = isConfidential ? createSHA256Hash(await randomBytesAsync(64)) : undefined;
    const newClient = new Client({
      clientName,
      isConfidential,
      redirectUris,
      clientSecret,
      user: req.user?._id as ObjectId
    });

    const client = await newClient.save();
    res.json({
      clientId: client.clientId,
      clientName: client.clientName,
      clientSecret,
      redirectUris: client.redirectUris
    });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      //TODO Find better way to handle with errors
      if (error.errors.length > 0) {
        const code = error.errors[0].code;
        if (code === 'custom_error') {
          res.json({ error: 'Only a-z A-Z 0-9 for clientName' });
          return;
        }
      }
      res.status(400).json({ error: 'Invalid request: clientName, isConfidential, redirectUris required' });
      return;
    }
    if (error.code === 11000) {
      res.status(400).json({ error: 'Client with that clientName already exists' });
      return;
    }
    return next(error);
  }
};
