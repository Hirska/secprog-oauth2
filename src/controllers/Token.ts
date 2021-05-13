import { Request, Response, NextFunction } from 'express';
import auth from 'basic-auth';
import bcrypt from 'bcrypt';
import Client from '../models/client';
import { CodeChallengeMethod, TokenRequest, DocumentCode } from '../types';
import Code from '../models/code';
import InvalidGrantError from '../errors/InvalidGrantError';
import InvalidClientError from '../errors/InvalidClientError';
import { tokenRequestSchema } from '../utils/parse';
import { createSHA256Hash, generateJwt } from '../utils/utils';

export const token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = tokenRequestSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json('Invalid request parameters');
      return;
    }
    const body = result.data;

    const { clientId, clientSecret } = getCredentials(req, body);
    const client = await Client.findOne({ clientId: clientId });

    if (!client) {
      throw new InvalidClientError('Invalid client');
    }
    const code = await Code.findOne({ code: body.code });

    if (!code) {
      throw new InvalidGrantError('Authorization code not found');
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
      if (!body.code_verifier) {
        throw new InvalidGrantError('Code verifier missing');
      }
      if (!validateCodeVerifier(body.code_verifier, code)) {
        throw new InvalidGrantError('Invalid code verifier');
      }
    }

    if (code.clientId !== client.clientId) {
      throw new InvalidClientError('Code is not issued to this client');
    }
    if (Date.now() > code.expiresAt) {
      throw new InvalidGrantError('Expired authorization code');
    }

    if (code.redirectUri && code.redirectUri !== body.redirect_uri) {
      throw new InvalidGrantError('Invalid redirect uri');
    }
    const payload = {
      userId: code.user,
      scopes: code.scopes
    };
    const { access_token, expires_in } = generateJwt(payload);

    //Revoke used authorization code.
    await code.delete();
    res.status(200).json({ access_token, expires_in, token_type: 'Bearer' });
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
    throw new InvalidClientError('client_id missing');
  }
  return { clientId: body.client_id, clientSecret: body.client_secret };
};

const validateCodeVerifier = (codeVerifier: string, code: DocumentCode) => {
  const codeChallengeMethod = code.codeChallengeMethod;
  const codeChallenge = code.codeChallenge;

  if (!codeChallenge || !codeChallengeMethod) {
    throw new InvalidGrantError('Invalid code challenge');
  }
  switch (codeChallengeMethod) {
    case CodeChallengeMethod.S256:
      const hash = createSHA256Hash(codeVerifier);
      return Buffer.from(hash).toString('base64') === codeChallenge;
    case CodeChallengeMethod.plain:
      return codeVerifier === codeChallenge;
    default:
      throw new InvalidGrantError('Invalid code challenge method');
  }
};

export default {
  token
};
