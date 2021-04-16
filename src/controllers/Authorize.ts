import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Client from '../models/client';
import Scope from '../models/scope';
import Code from '../models/code';
import { DocumentUser, DocumentClient } from '../types';
import { parseToStringOrUndefined, toUser, parseResponseType } from '../utils/parse';
import InvalidScopeError from '../errors/InvalidScopeError';
import { add } from 'date-fns';

import querystring from 'querystring';
import crypto from 'crypto';
import { promisify } from 'util';
import { ObjectId } from 'mongoose';

const randomBytesAsync = promisify(crypto.randomBytes);

export const authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await validateClient(req.query.client_id);

    if (client === null) {
      return res.render('authenticate', { message: 'Invalid client identification', messageClass: 'alert-danger' });
    }

    const redirectUrl = validateRedirectUrl(req.query.redirect_url, client);

    if (redirectUrl === null) {
      return res.render('authenticate', { message: 'Invalid or missing redirect url', messageClass: 'alert-danger' });
    }

    //Redirect user back to redirect url if invalid response_type
    parseResponseType(req.query.response_type);

    //Validate scopes. Is optional
    const scopes: string[] | undefined = await getScopes(req.query.scope);

    const { email, password } = toUser(req.body);
    const user: DocumentUser | null = await User.findOne({ email });
    if (!user) {
      return res.render('authenticate', { message: 'Invalid username or password', messageClass: 'alert-danger' });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.render('authenticate', { message: 'Invalid username or password', messageClass: 'alert-danger' });
    }
    const randomBytes = await randomBytesAsync(48);

    const state = parseToStringOrUndefined(req.query.state);
    //Generate new authorization code.
    const code = new Code({
      expiresAt: add(Date.now(), { minutes: 10 }),
      code: crypto.createHash('sha256').update(randomBytes).digest('hex'),
      clientId: client.clientId,
      scopes: scopes,
      redirectUrl,
      user: user._id as ObjectId
    });
    await code.save();

    const queryparams = generateQuerystring(code.code, state);

    //redirect authorization code to callback address.
    res.redirect(`${redirectUrl}?${queryparams}`);
  } catch (error) {
    return next(error);
  }
};
const getScopes = async (scope: unknown): Promise<string[] | undefined> => {
  const scopeString = parseToStringOrUndefined(scope);
  if (!scopeString) {
    return undefined;
  }
  const scopes: string[] = scopeString.split(' ');

  for (const scope of scopes) {
    const validScope = await Scope.findOne({ scope: scope });

    if (!validScope) {
      throw new InvalidScopeError(`Invalid scope: ${scope}`);
    }
  }
  return scopes;
};

const validateClient = async (client_id: unknown): Promise<DocumentClient | null> => {
  const clientId = parseToStringOrUndefined(client_id);
  if (!clientId) {
    return null;
  }
  const client = await Client.findOne({ clientId });

  if (!client) {
    return null;
  }
  return client;
};

const validateRedirectUrl = (redirect_url: unknown, client: DocumentClient): string | null => {
  const redirectUrl = parseToStringOrUndefined(redirect_url);

  if (redirectUrl) {
    if (!client.redirectUrls.includes(redirectUrl)) {
      return null;
    }
    return redirectUrl;
  }
  if (client.redirectUrls.length !== 1) {
    return null;
  }
  return client.redirectUrls[0];
};

const generateQuerystring = (code: string, state: string | undefined): string => {
  if (state) {
    return querystring.stringify({ code, state });
  }

  return querystring.stringify({ code });
};

export default {
  authorize
};
