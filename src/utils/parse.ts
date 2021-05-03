import InvalidRequestError from '../errors/InvalidRequestError';
import { ResponseType, TokenRequest, GrantType, CodeChallengeMethod } from '../types';
import * as z from 'zod';
import isURL from 'validator/lib/isURL';
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
  if (tokenRequest.code_verifier) {
    request.code_verifier = parseToString(tokenRequest.code_verifier, 'code_verifier');
  }

  return request;
};

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const newUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirm']
  });

export const codeChallengeSchema = z.object({
  codeChallenge: z.string(),
  codeChallengeMethod: z.nativeEnum(CodeChallengeMethod).optional()
});

export const stringSchema = z.string();
export const uriSchema = z.string().refine(
  (val) => {
    return isURL(val, {
      protocols: ['http', 'https'],
      require_protocol: true,
      /*TODO: Set require tld to false when localhost is no longer needed*/ require_tld: false
    });
  },
  {
    message: 'Invalid email'
  }
);

export const parseToString = (param: unknown, paramName: string): string => {
  if (!param || !isString(param)) {
    throw new InvalidRequestError(`Incorrect or missing ${paramName}:` + param);
  }
  return param;
};

export const parseToStringOrUndefined = (param: unknown): string | undefined => {
  if (!param || !isString(param)) {
    return;
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

export const parseCodeChallengeMethod = (challengeMethod: unknown): CodeChallengeMethod | undefined => {
  //Defaults to plain if challenge_method is omitted
  if (!challengeMethod) {
    return CodeChallengeMethod.plain;
  }
  if (!isCodeChallengeMethod(challengeMethod)) {
    return;
  }
  return challengeMethod;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isCodeChallengeMethod = (param: any): param is CodeChallengeMethod => {
  return Object.values(CodeChallengeMethod).includes(param);
};

export default {
  userSchema,
  newUserSchema
};
