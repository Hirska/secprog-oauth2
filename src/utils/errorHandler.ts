import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import querystring from 'querystring';
import GeneralError from '../errors/GeneralError';
import RedirectError from '../errors/RedirectError';
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const message = err.message || 'Something went wrong!';

  if (err instanceof GeneralError) {
    return res.status(err.code).json({ error: err.name, error_description: err.message });
  }

  if (err instanceof RedirectError) {
    if (err.redirectUrl) {
      const errorString = querystring.stringify({ error: err.name, error_message: err.message });
      return res.redirect(`${err.redirectUrl}?${errorString}`);
    }
    return res.status(err.code).json({ error: err.name, error_description: err.message });
  }
  if (err instanceof TokenExpiredError) {
    return res.status(403).send('Forbidden');
  }
  if (err instanceof JsonWebTokenError) {
    return res.status(403).send('Forbidden');
  }

  return res.status(500).send({ message });
};

export default errorHandler;
