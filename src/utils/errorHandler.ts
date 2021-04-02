import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const message = err.message || 'Something went wrong!';
  let code = 500;

  if (err.name === 'UnauthorizedError') {
    code = 403;
  }

  res.status(code).send({ message });
};

export default errorHandler;
