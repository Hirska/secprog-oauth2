import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import querystring from 'querystring';
import crypto from 'crypto';
import { ObjectId } from 'mongoose';
import { add } from 'date-fns';
import { ZodError } from 'zod';

import User from '../models/user';
import Client from '../models/client';
import Scope from '../models/scope';
import Code from '../models/code';

import { DocumentUser, DocumentClient, DocumentScope, CodeChallengeMethod } from '../types';

import {
  userSchema,
  stringSchema,
  uriSchema,
  codeChallengeSchema,
  optStringSchema,
  uuidSchema,
  responseTypeSchema
} from '../utils/parse';

import InvalidScopeError from '../errors/InvalidScopeError';
import InvalidRequestError from '../errors/InvalidRequestError';
import InvalidClientError from '../errors/InvalidClientError';

import { randomBytesAsync } from '../utils/utils';

export const postAuthorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { client, redirectUrl } = await validateAuthorizeRequest(req);
    //Set redirect uri to be used in redirect errors
    req.redirectUri = redirectUrl;

    const scopes: DocumentScope[] | undefined = await validateScopes(req.query.scope);

    //Code challenge for public clients
    const { codeChallenge, codeChallengeMethod } = validateCodeChallenge(
      req.query.code_challenge,
      req.query.code_challenge_method,
      client
    );

    //Redirect user back to redirect url if invalid response_type
    responseTypeSchema.parse(req.query.response_type);

    // Returns DocumentUser or undefined
    const user = await validateUser(req.body);

    if (!user) {
      return res.render(
        'authorize',
        generateInputObject(
          req,
          scopes?.map((scope) => scope.description),
          client.clientName,
          redirectUrl,
          'Invalid username or password'
        )
      );
    }

    const randomBytes = await randomBytesAsync(48);

    const state = optStringSchema.parse(req.query.state);
    //Generate new authorization code.
    const code = new Code({
      expiresAt: add(Date.now(), { minutes: 10 }),
      code: crypto.createHash('sha256').update(randomBytes).digest('hex'),
      clientId: client.clientId,
      scopes: scopes?.map((scope) => scope.scope),
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
    if (error instanceof ZodError) {
      return next(new InvalidRequestError('Invalid request'));
    }
    if (error instanceof InvalidClientError) {
      return res.render('error', { message: error.message, messageClass: 'alert-danger' });
    }
    return next(error);
  }
};

export const getAuthorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { client, redirectUrl } = await validateAuthorizeRequest(req);
    //Set redirect uri to be used in redirect errors
    req.redirectUri = redirectUrl;

    const scopes: DocumentScope[] | undefined = await validateScopes(req.query.scope);
    return res.render(
      'authorize',
      generateInputObject(
        req,
        scopes?.map((scope) => scope.description),
        client.clientName,
        redirectUrl
      )
    );
  } catch (error) {
    if (error instanceof InvalidClientError) {
      return res.render('error', { message: error.message, messageClass: 'alert-danger' });
    }
    return next(error);
  }
};

const validateAuthorizeRequest = async (req: Request) => {
  const client = await validateClient(req.query.client_id);

  //Redirect url is required
  //TODO: Change redirectUrls to redirectUris
  const redirectUrl = validateRedirectUrl(req.query.redirect_uri, client);

  return { client, redirectUrl };
};

const validateScopes = async (scope: unknown): Promise<DocumentScope[] | undefined> => {
  const result = stringSchema.safeParse(scope);
  if (!result.success) {
    throw new InvalidScopeError(`Invalid scopes`);
  }
  const scopes: DocumentScope[] = [];
  for (const scope of result.data.split(' ')) {
    const validScope = await Scope.findOne({ scope }).orFail(new InvalidScopeError(`Invalid scope: ${scope}`));
    scopes.push(validScope);
  }
  return scopes;
};

const validateClient = async (client_id: unknown): Promise<DocumentClient> => {
  //TODO: add specific parse for uuid
  const result = uuidSchema.safeParse(client_id);
  if (!result.success) {
    throw new InvalidClientError('Invalid or missing client');
  }
  const client = await Client.findOne({ clientId: result.data }).orFail(
    new InvalidClientError('No client with given id')
  );
  return client;
};

const validateRedirectUrl = (redirect_url: unknown, client: DocumentClient): string => {
  const result = uriSchema.safeParse(redirect_url);
  if (!result.success || !client.redirectUrls.includes(result.data)) {
    throw new InvalidClientError('Invalid or missing redirect url');
  }
  return result.data;
};

const validateCodeChallenge = (codeChallenge: unknown, codeChallengeMethod: unknown, client: DocumentClient) => {
  if (client.isConfidential) {
    return { codeChallenge: undefined, codeChallengeMethod: undefined };
  }
  const result = codeChallengeSchema.safeParse({ codeChallenge, codeChallengeMethod });
  if (!result.success) {
    throw new InvalidRequestError('Invalid or missing code challenge / code challenge method');
  }

  return {
    codeChallenge: result.data.codeChallenge,
    codeChallengeMethod: result.data.codeChallengeMethod || CodeChallengeMethod.plain
  };
};

const validateUser = async (data: { email: unknown; password: unknown }): Promise<DocumentUser | undefined> => {
  const result = userSchema.safeParse(data);

  if (!result.success) {
    return;
  }

  const { email, password } = result.data;
  const user: DocumentUser | null = await User.findOne({ email });

  if (!user) {
    return;
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return;
  }
  return user;
};

const generateQuerystring = (code: string, state: string | undefined): string => {
  if (state) {
    return querystring.stringify({ code, state });
  }

  return querystring.stringify({ code });
};

const generateInputObject = (
  req: Request,
  scopes: string[] | undefined,
  client: string,
  redirectUrl: string,
  message?: string
) => {
  const returnTo = querystring.stringify({ return_to: req.originalUrl });
  const accessDenied = `${redirectUrl}?${querystring.stringify({ error: 'access_denied' })}`;

  return { message, messageClass: 'alert-danger', scopes, returnTo, accessDenied, client };
};

export default {
  postAuthorize,
  getAuthorize
};
