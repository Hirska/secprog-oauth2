import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import Client from '../models/client';
import Scope from '../models/scope';
import Code from '../models/code';
import { DocumentUser } from '../types';
import { toAuthorizationRequest, toUser } from '../utils/utils';
//import InvalidClientError from '../errors/InvalidClientError';
import InvalidRequestError from '../errors/InvalidRequestError';
import InvalidScopeError from '../errors/InvalidScopeError';
import { add } from 'date-fns';

import querystring from 'querystring';
import crypto from 'crypto';
import { promisify } from 'util';
import { ObjectId } from 'mongoose';

const randomBytesAsync = promisify(crypto.randomBytes);

export const authorize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorization = toAuthorizationRequest(req.query);
    const { email, password } = toUser(req.body);

    const client = await Client.findOne({ clientId: authorization.client_id });

    //TODO: MOVE client and redirect url validation to get request
    // Validate client id
    if (!client) {
      return res.render('authenticate', { message: 'No client with given id', messageClass: 'alert-danger' });

      //throw new InvalidClientError('Invalid client: client credentials are invalid');
    }
    // Validate redirect url
    let redirectUrl: string | undefined;
    if (authorization.redirect_url) {
      if (!client.redirectUrls.includes(authorization.redirect_url)) {
        return res.render('authenticate', { message: 'Redirect url is invalid', messageClass: 'alert-danger' });
        //throw new InvalidRequestError('Invalid redirect url');
      }
      redirectUrl = authorization.redirect_url;
    } else {
      if (client.redirectUrls.length > 1) {
        throw new InvalidRequestError('Redirect url missing');
      }
      authorization.redirect_url = client.redirectUrls[0];
    }

    //TODO: Handle error by redirecting user back to redirect url.
    //Validate scope
    let scopes: string[] | undefined;
    if (authorization.scope) {
      scopes = await validateScopes(authorization.scope);
    }

    const user: DocumentUser | null = await User.findOne({ email });
    if (!user) {
      throw new Error('Username or password wrong');
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new Error('Username or password wrong');
    }
    const randomBytes = await randomBytesAsync(48);

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

    const queryparams = generateQuerystring(code.code, authorization.state);

    //redirect authorization code to callback address.
    res.redirect(`${authorization.redirect_url}?${queryparams}`);
  } catch (error) {
    return next(error);
  }
};
const validateScopes = async (scope: string) => {
  const scopes: string[] = scope.split(' ');

  for (const scope of scopes) {
    const validScope = await Scope.findOne({ scope: scope });

    if (!validScope) {
      throw new InvalidScopeError(`Invalid scope: ${scope}`);
    }
  }
  return scopes;
};

const generateQuerystring = (code: string, state: string | undefined): string => {
  //TODO: remove state if it is undefined
  if (state) return querystring.stringify({ code, state });

  return querystring.stringify({ code });
};

export default {
  authorize
};
