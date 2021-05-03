import { DocumentUser } from './src/types';

declare global {
  namespace Express {
    interface Request {
      redirectUri?: string;
      user?: DocumentUser;
    }
  }
}
