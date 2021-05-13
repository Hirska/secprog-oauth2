import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { stringSchema } from '../utils/parse';
import settings from '../utils/settings';
import { JWTData } from '../types';
import User from '../models/user';
import logger from '../utils/logger';

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
        logger.info(`Unauthorized access with ${JSON.stringify(decoded)}`);
        return res.status(401).json('Unauthorized');
      }

      if (scope) {
        // If user is logged in, it has access to all scopes. Otherwise check if token has required scope
        if (!decoded.loggedIn && !decoded.scopes?.includes(scope)) {
          logger.info(`Invalid scope: required: ${scope}, token: ${JSON.stringify(decoded)}`);
          return res.status(404).json('Invalid scope');
        }
      }
      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
