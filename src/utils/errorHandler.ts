import { Request, Response, NextFunction } from 'express';
import GeneralError from '../errors/GeneralError';
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const message = err.message || 'Something went wrong!';

  if (err instanceof GeneralError) {
    return res.status(err.code).json({ error: err.name, error_description: err.message });
  }

  return res.status(500).send({ message });
};

export default errorHandler;
