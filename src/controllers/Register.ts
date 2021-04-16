import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { parseToStringOrUndefined, toUser } from '../utils/parse';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, role } = toUser(req.body);

    if (password !== req.body.confirmPassword) {
      return res.render('register', { message: 'Passwords does not match', messageClass: 'alert-danger' });
    }

    const newUser = new User({
      email,
      password,
      role
    });

    await newUser.save();

    const returnTo = parseToStringOrUndefined(req.query.return_to);
    if (returnTo) {
      return res.redirect(returnTo);
    }
    return res.render('register', { message: `New user successfully created`, messageClass: 'alert-success' });
  } catch (error) {
    if (error.code === 11000) {
      return res.render('register', {
        message: `Username with that email already exists`,
        messageClass: 'alert-danger'
      });
    }
    return next(error);
  }
};
