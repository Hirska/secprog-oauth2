import { Document, ObjectId } from 'mongoose';
import * as z from 'zod';
import { newUserSchema, tokenRequestSchema, userSchema } from './utils/parse';
export interface JWTData {
  userId: string;
  scopes?: string[];
  loggedIn?: boolean;
}

export interface ICode {
  code: string;
  redirectUri: string;
  expiresAt: number;
  clientId: string;
  scopes: string[];
  user: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface IClient {
  user: ObjectId;
  redirectUris: string[];
  clientId: string;
  clientSecret?: string;
  clientName: string;
  isConfidential: boolean;
  grants?: string[];
}

export interface IUser extends z.infer<typeof userSchema> {
  role: UserRole;
}

export interface INewUser extends z.infer<typeof newUserSchema> {
  role: UserRole;
}

export interface IScope {
  scope: string;
  description: string;
}
export interface AuthorizationRequest {
  response_type: ResponseType;
  client_id: string;
  redirect_uri?: string;
  scope?: string;
  state?: string;
}

export type TokenRequest = z.infer<typeof tokenRequestSchema>;

export enum GrantType {
  code = 'authorization_code'
}

export enum ResponseType {
  code = 'code'
}

export enum UserRole {
  admin = 'admin',
  user = 'user'
}

export enum CodeChallengeMethod {
  S256 = 's256',
  plain = 'plain'
}
export interface DocumentClient extends IClient, Document {}
export interface DocumentUser extends IUser, Document {}
export interface DocumentScope extends IScope, Document {}
export interface DocumentCode extends ICode, Document {}
