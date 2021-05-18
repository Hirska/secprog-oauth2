import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import User from '../models/user';
import { UserRole } from '../types';
import { newUserSchema, optStringSchema } from '../utils/parse';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = newUserSchema.parse(req.body);

    const newUser = new User({
      email,
      password,
      role: UserRole.user
    });

    await newUser.save();

    const returnTo = optStringSchema.parse(req.query.return_to);
    if (returnTo) {
      return res.redirect(returnTo);
    }

    return res.redirect('/authorize');
  } catch (error) {
    if (error instanceof ZodError) {
      if (error.errors.length > 0) {
        const message = error.errors[0].message;
        return res.render('register', { message, messageClass: 'alert-danger' });
      }
      return res.render('register', { message: 'Try again', messageClass: 'alert-danger' });
    }
    if (error.code === 11000) {
      return res.render('register', {
        message: `Username with that email already exists`,
        messageClass: 'alert-danger'
      });
    }
    return next(error);
  }
};
