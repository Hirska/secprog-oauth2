import { Request, Response, NextFunction } from 'express';
import auth from 'basic-auth';
import bcrypt from 'bcrypt';
import { isBefore } from 'date-fns';
import jwt from 'jsonwebtoken';
import { toTokenRequest } from '../utils/utils';
import Client from '../models/client';
import { TokenRequest } from '../types';
import InvalidRequestError from '../errors/InvalidRequestError';
import Code from '../models/code';
import InvalidGrantError from '../errors/InvalidGrantError';
import InvalidClientError from '../errors/InvalidClientError';

// TODO: Find better way
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRATION = process.env.JWT_SECRET || '3600';

export const token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = toTokenRequest(req.body);
    const { clientId, clientSecret } = getCredentials(req, body);
    const client = await Client.findOne({ clientId: clientId });

    if (!client) {
      throw new InvalidClientError('Invalid client');
    }

    if (client.isConfidential) {
      if (!clientSecret || !client.clientSecret) {
        throw new InvalidClientError('Invalid credentials');
      }
      const match = await bcrypt.compare(clientSecret, client.clientSecret);
      if (!match) {
        throw new InvalidClientError('Invalid credentials');
      }
    } else {
      //TODO: implement pkce
    }
    const code = await Code.findOne({ code: body.code });

    if (!code) {
      throw new InvalidGrantError('Authorization code not found');
    }

    if (code.clientId !== client.clientId) {
      throw new InvalidClientError('Code is not issued to this client');
    }

    if (isBefore(new Date(code.expiresAt), Date.now())) {
      throw new InvalidGrantError('Expired authorization code');
    }

    if (code.redirectUrl && code.redirectUrl !== body.redirect_url) {
      throw new InvalidGrantError('Invalid redirect url');
    }

    //Revoke used authorization code.
    //await code.delete();
    const access_token = jwt.sign(
      {
        userId: code.user,
        scopes: code.scopes
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    res.status(200).json({ access_token, expires_in: JWT_EXPIRATION, token_type: 'Bearer' });
  } catch (error) {
    return next(error);
  }
};

const getCredentials = (req: Request, body: TokenRequest) => {
  const credentials = auth(req);

  if (credentials) {
    return { clientId: credentials.name, clientSecret: credentials.pass };
  }
  if (!body.client_id) {
    throw new InvalidRequestError('client_id missing');
  }
  return { clientId: body.client_id, clientSecret: body.client_secret };
};

export default {
  token
};
