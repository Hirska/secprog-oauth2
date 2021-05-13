import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import querystring from 'querystring';
import { add } from 'date-fns';
import { ZodError } from 'zod';
import isEmpty from 'lodash.isempty';
import logger from '../utils/logger';
import User from '../models/user';
import Client from '../models/client';
import Scope from '../models/scope';
import Code from '../models/code';

import { DocumentUser, DocumentClient, DocumentScope, CodeChallengeMethod } from '../types';

import {
  userSchema,
  uriSchema,
  codeChallengeSchema,
  optStringSchema,
  uuidSchema,
  responseTypeSchema
} from '../utils/parse';

import InvalidScopeError from '../errors/InvalidScopeError';
import InvalidRequestError from '../errors/InvalidRequestError';
import InvalidClientError from '../errors/InvalidClientError';

import { createSHA256Hash, generateJwt, randomBytesAsync } from '../utils/utils';

export const postAuthorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (isEmpty(req.query)) {
      const user = await validateUser(req.body);
      if (user) {
        const payload = {
          userId: user.id as string,
          loggedIn: true
        };
        const { access_token, expires_in } = generateJwt(payload);
        res.status(200).json({ access_token, expires_in, token_type: 'Bearer' });
        return;
      }
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }
    const { client, redirectUri } = await validateAuthorizeRequest(req);
    //Set redirect uri to be used in redirect errors
    req.redirectUri = redirectUri;

    const scopes: DocumentScope[] | undefined = await validateScopes(req.query.scope);

    //Code challenge for public clients
    const { codeChallenge, codeChallengeMethod } = validateCodeChallenge(
      req.query.code_challenge,
      req.query.code_challenge_method,
      client
    );

    //Redirect user back to redirect uri if invalid response_type
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
          redirectUri,
          'Invalid username or password'
        )
      );
    }

    const randomBytes = await randomBytesAsync(48);

    const state = optStringSchema.parse(req.query.state);
    //Generate new authorization code.
    const code = new Code({
      expiresAt: add(Date.now(), { minutes: 10 }),
      code: createSHA256Hash(randomBytes),
      clientId: client.clientId,
      scopes: scopes?.map((scope) => scope.scope),
      redirectUri,
      user: user.id as string,
      codeChallenge,
      codeChallengeMethod
    });
    await code.save();

    const queryparams = generateQuerystring(code.code, state);

    //redirect authorization code to callback address.
    res.redirect(`${redirectUri}?${queryparams}`);
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (isEmpty(req.query)) {
      return res.render('authorize');
    }
    const { client, redirectUri } = await validateAuthorizeRequest(req);
    //Set redirect uri to be used in redirect errors
    req.redirectUri = redirectUri;

    const scopes: DocumentScope[] | undefined = await validateScopes(req.query.scope);
    return res.render(
      'authorize',
      generateInputObject(
        req,
        scopes?.map((scope) => scope.description),
        client.clientName,
        redirectUri
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

  //Redirect uri is required
  const redirectUri = validateRedirectUri(req.query.redirect_uri, client);

  return { client, redirectUri };
};

const validateScopes = async (scope: unknown): Promise<DocumentScope[] | undefined> => {
  const result = optStringSchema.safeParse(scope);
  if (!result.success) {
    throw new InvalidScopeError(`Invalid scopes`);
  }

  //Default to default scopes if there is no required scopes
  if (!result.data) {
    const defaultScopes = await Scope.find({ default: true });
    if (defaultScopes.length === 0) {
      return;
    }
    return defaultScopes;
  }

  const scopes: DocumentScope[] = [];
  for (const scope of result.data.split(' ')) {
    const validScope = await Scope.findOne({ scope }).orFail(new InvalidScopeError(`Invalid scope: ${scope}`));
    scopes.push(validScope);
  }
  return scopes;
};

const validateClient = async (client_id: unknown): Promise<DocumentClient> => {
  const result = uuidSchema.safeParse(client_id);
  if (!result.success) {
    throw new InvalidClientError('Invalid or missing client');
  }
  const client = await Client.findOne({ clientId: result.data }).orFail(
    new InvalidClientError('No client with given id')
  );
  return client;
};

const validateRedirectUri = (redirect_uri: unknown, client: DocumentClient): string => {
  const result = uriSchema.safeParse(redirect_uri);
  if (!result.success || !client.redirectUris.includes(result.data)) {
    throw new InvalidClientError('Invalid or missing redirect uri');
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
    logger.info(`Log in with invalid email ${email}`);
    return;
  }
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    logger.info(`Invalid password with email ${email}`);
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
  redirectUri: string,
  message?: string
) => {
  const returnTo = querystring.stringify({ return_to: req.originalUrl });
  const accessDenied = `${redirectUri}?${querystring.stringify({ error: 'access_denied' })}`;

  return { message, messageClass: 'alert-danger', scopes, returnTo, accessDenied, client };
};

export default {
  postAuthorize,
  getAuthorize
};
