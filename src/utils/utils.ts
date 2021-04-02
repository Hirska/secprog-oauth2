import { IUser, AuthorizationRequest, ResponseType, UserRole } from '../types';
type UserFields = { username: unknown; password: unknown };
export const toUser = ({ username, password }: UserFields): IUser => {
  const user: IUser = {
    username: parseToString(username, 'username'),
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

const parseToString = (param: unknown, paramName: string): string => {
  if (!param || !isString(param)) {
    throw new Error(`Incorrect or missing ${paramName}:` + param);
  }
  return param;
};

const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

const parseResponseType = (responseType: unknown): ResponseType => {
  if (!responseType || !isResponseType(responseType)) {
    throw new Error('Incorrect or missing response_type: ' + responseType);
  }
  return responseType;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isResponseType = (param: any): param is ResponseType => {
  return Object.values(ResponseType).includes(param);
};

/*
const parseUserRole = (userRole: unknown): UserRole => {
  if (!userRole || !isUserRole(userRole)) {
    throw new Error('Incorrect or missing userRole: ' + userRole);
  }
  return userRole;
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isUserRole = (param: any): param is UserRole => {
  return Object.values(UserRole).includes(param);
};
*/

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
