import { Document, ObjectId } from 'mongoose';

export interface ICode extends Document {
  code: string;
  redirectUrl: string;
  expiresAt: number;
  clientId: string;
  scopes: string[];
  user: ObjectId | DocumentUser;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface IClient {
  user: string;
  redirectUrls: string[];
  clientId: string;
  clientSecret?: string;
  clientName: string;
  isConfidential: boolean;
  grants?: string[];
}

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
}

export interface IScope {
  scope: string;
  description: string;
}
export interface AuthorizationRequest {
  response_type: ResponseType;
  client_id: string;
  redirect_url?: string;
  scope?: string;
  state?: string;
}

export interface TokenRequest {
  grant_type: GrantType;
  code: string;
  redirect_url?: string;
  client_id?: string;
  client_secret?: string;
}

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
  S256 = 'S256',
  plain = 'plain'
}
export interface DocumentClient extends IClient, Document {}
export interface DocumentUser extends IUser, Document {}
export interface DocumentClient extends IClient, Document {}
export interface DocumentScope extends IScope, Document {}
