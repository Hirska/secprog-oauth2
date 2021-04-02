import { Document } from 'mongoose';

export interface ICode extends Document {
  authorizationCode: string;
  redirectUri: string;
  lifetime: number;
  clientId: string;
  scope: string;
}

export interface IClient {
  user: string;
  redirectUris: string[];
  clientId: string;
  clientSecret: string;
  grants?: string[];
}

export interface IUser {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthorizationRequest {
  response_type: ResponseType;
  client_id: string;
  redirect_url?: string;
  scope?: string;
  state?: string;
}

export enum ResponseType {
  code = 'code',
  token = 'token'
}

export enum UserRole {
  admin = 'admin',
  user = 'user'
}
export interface DocumentClient extends IClient, Document {}
export interface DocumentUser extends IUser, Document {}
export interface DocumentClient extends IClient, Document {}
