import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import querystring from 'querystring';
import GeneralError from '../errors/GeneralError';
import RedirectError from '../errors/RedirectError';
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const message = err.message || 'Something went wrong!';

  if (err instanceof GeneralError) {
    return res.status(err.code).json({ error: err.name, error_description: err.message });
  }

  if (err instanceof RedirectError) {
    if (req.redirectUri) {
      const errorString = querystring.stringify({ error: err.name, error_message: err.message });
      return res.redirect(`${req.redirectUri}?${errorString}`);
    }
    return res.status(err.code).json({ error: err.name, error_description: err.message });
  }
  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    return res.status(401).send('Unauthorized');
  }

  return res.status(500).send({ message });
};

export default errorHandler;
