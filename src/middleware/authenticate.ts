import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { parseToStringOrUndefined } from '../utils/parse';
import settings from '../utils/settings';
import { JWTData } from '../types';

export default (scope?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = parseToStringOrUndefined(req.headers.authorization);
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, settings.JWT_SECRET) as JWTData;
        if (scope && !decoded.scopes.includes(scope)) {
          return res.status(404).json('Invalid scope');
        }
      }
      next();
    } catch (error) {
      return next(error);
    }
  };
};
