import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { stringSchema } from '../utils/parse';
import settings from '../utils/settings';
import { AuthenticatedRequest, JWTData } from '../types';
import User from '../models/user';

export default (scope?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = stringSchema.safeParse(req.headers.authorization);
      if (!result.success) {
        return res.status(401).json('Unauthorized');
      }
      const authHeader = result.data;
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, settings.JWT_SECRET) as JWTData;
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json('Unauthorized');
      }
      if (scope && !decoded.scopes.includes(scope)) {
        return res.status(404).json('Invalid scope');
      }

      //TODO: find better way to extend express-request
      (req as AuthenticatedRequest).user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
