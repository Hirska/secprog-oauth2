import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Client from '../models/client';
import Scope from '../models/scope';
import Code from '../models/code';
import { DocumentUser, DocumentClient } from '../types';
import { parseToStringOrUndefined, toUser, parseResponseType, parseCodeChallengeMethod } from '../utils/parse';
import InvalidScopeError from '../errors/InvalidScopeError';
import { add } from 'date-fns';

import querystring from 'querystring';
import crypto from 'crypto';
import { promisify } from 'util';
import { ObjectId } from 'mongoose';
import InvalidRequestError from '../errors/InvalidRequestError';

const randomBytesAsync = promisify(crypto.randomBytes);

export const authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const client = await validateClient(req.query.client_id);

    if (!client) {
      return res.render('error', { message: 'Invalid client identification', messageClass: 'alert-danger' });
    }

    //Redirect url is required
    const redirectUrl = validateRedirectUrl(req.query.redirect_url, client);

    if (!redirectUrl) {
      return res.render('error', { message: 'Invalid or missing redirect url', messageClass: 'alert-danger' });
    }

    //Code challenge for public clients
    const { codeChallenge, codeChallengeMethod } = validateCodeChallenge(
      req.query.code_challenge,
      req.query.code_challenge_method,
      client,
      redirectUrl
    );

    //Redirect user back to redirect url if invalid response_type
    parseResponseType(req.query.response_type);

    //Validate scopes. Is optional
    const scopes: string[] | undefined = await validateScopes(req.query.scope, redirectUrl);

    const { email, password } = toUser(req.body);
    const user: DocumentUser | null = await User.findOne({ email });
    if (!user) {
      return res.render(
        'authorize',
        generateInputObject(req, scopes, client.clientName, 'Invalid username or password')
      );
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.render(
        'authorize',
        generateInputObject(req, scopes, client.clientName, 'Invalid username or password')
      );
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
      user: user._id as ObjectId,
      codeChallenge,
      codeChallengeMethod
    });
    await code.save();

    const queryparams = generateQuerystring(code.code, state);

    //redirect authorization code to callback address.
    res.redirect(`${redirectUrl}?${queryparams}`);
  } catch (error) {
    return next(error);
  }
};

export const validateScopes = async (scope: unknown, redirectUrl: string): Promise<string[] | undefined> => {
  const scopeString = parseToStringOrUndefined(scope);
  if (!scopeString) {
    return undefined;
  }
  const scopes: string[] = scopeString.split(' ');

  for (const scope of scopes) {
    const validScope = await Scope.findOne({ scope: scope });

    if (!validScope) {
      throw new InvalidScopeError(`Invalid scope: ${scope}`, redirectUrl);
    }
  }
  return scopes;
};

export const validateClient = async (client_id: unknown): Promise<DocumentClient | undefined> => {
  const clientId = parseToStringOrUndefined(client_id);
  if (!clientId) {
    return;
  }
  const client = await Client.findOne({ clientId });

  if (!client) {
    return;
  }
  return client;
};

export const validateRedirectUrl = (redirect_url: unknown, client: DocumentClient): string | undefined => {
  const redirectUrl = parseToStringOrUndefined(redirect_url);

  if (redirectUrl) {
    if (!client.redirectUrls.includes(redirectUrl)) {
      return;
    }
    return redirectUrl;
  }
  return;
};

const validateCodeChallenge = (
  code_challenge: unknown,
  code_challenge_method: unknown,
  client: DocumentClient,
  redirect_url: string
) => {
  if (client.isConfidential) {
    return { codeChallenge: undefined, codeChallengeMethod: undefined };
  }

  const codeChallenge = parseToStringOrUndefined(code_challenge);
  const codeChallengeMethod = parseCodeChallengeMethod(code_challenge_method);

  if (!codeChallenge) {
    throw new InvalidRequestError('Code challenge missing', redirect_url);
  }

  if (!codeChallengeMethod) {
    throw new InvalidRequestError('Code challenge method missing', redirect_url);
  }

  return { codeChallenge, codeChallengeMethod };
};

export const generateQuerystring = (code: string, state: string | undefined): string => {
  if (state) {
    return querystring.stringify({ code, state });
  }

  return querystring.stringify({ code });
};

export const generateInputObject = (req: Request, scopes: string[] | undefined, client: string, message?: string) => {
  const returnTo = querystring.stringify({ return_to: req.originalUrl });
  const accessDenied = querystring.stringify({ error: 'access_denied' });

  return { message, messageClass: 'alert-danger', scopes, returnTo, accessDenied, client };
};

export default {
  authorize
};
