import Joi from 'joi';
import joi from 'joi';
import InvalidRequestError from '../errors/InvalidRequestError';
import { IUser, AuthorizationRequest, ResponseType, UserRole, TokenRequest, GrantType } from '../types';
type UserFields = { email: unknown; password: unknown };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toTokenRequest = (tokenRequest: any): TokenRequest => {
  const request: TokenRequest = {
    grant_type: parseGrantType(tokenRequest.grant_type),
    code: parseToString(tokenRequest.code, 'code')
  };
  if (tokenRequest.client_id) {
    request.client_id = parseToString(tokenRequest.client_id, 'client_id');
  }
  if (tokenRequest.client_secret) {
    request.client_secret = parseToString(tokenRequest.client_secret, 'client_secret');
  }
  if (tokenRequest.redirect_url) {
    request.redirect_url = parseToString(tokenRequest.redirect_url, 'redirect_url');
  }

  return request;
};
export const toUser = ({ email, password }: UserFields): IUser => {
  const user: IUser = {
    email: parseToString(email, 'email'),
    password: parseToString(password, 'password'),
    role: UserRole.user
  };
  return user;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toAuthorizationRequest = (authorizationRequest: any): AuthorizationRequest => {
  const authorization: AuthorizationRequest = {
    response_type: parseResponseType(authorizationRequest.response_type),
    client_id: parseToString(authorizationRequest.client_id, 'client_id')
  };

  if (authorizationRequest.redirect_url) {
    authorization.redirect_url = parseToString(authorizationRequest.redirect_url, 'redirect_url');
  }
  if (authorizationRequest.scope) {
    authorization.scope = parseToString(authorizationRequest.scope, 'scope');
  }
  if (authorizationRequest.state) {
    authorization.state = parseToString(authorizationRequest.state, 'state');
  }

  return authorization;
};

export const parseToString = (param: unknown, paramName: string): string => {
  if (!param || !isString(param)) {
    throw new InvalidRequestError(`Incorrect or missing ${paramName}:` + param);
  }
  return param;
};

export const parseToStringOrUndefined = (param: unknown): string | undefined => {
  if (!param || !isString(param)) {
    return undefined;
  }
  return param;
};

export const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

export const parseResponseType = (responseType: unknown): ResponseType => {
  if (!responseType || !isResponseType(responseType)) {
    throw new InvalidRequestError('Incorrect or missing response_type: ' + responseType);
  }
  return responseType;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isResponseType = (param: any): param is ResponseType => {
  return Object.values(ResponseType).includes(param);
};

const parseGrantType = (grantType: unknown): GrantType => {
  if (!grantType || !isGrantType(grantType)) {
    throw new InvalidRequestError('Incorrect or missing grant_type: ' + grantType);
  }
  return grantType;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isGrantType = (param: any): param is GrantType => {
  return Object.values(GrantType).includes(param);
};

/**
 * Helper function for exhaustive type checking
 */
export const assertNever = (value: never): never => {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
};

export default {
  toUser,
  toAuthorizationRequest
};
