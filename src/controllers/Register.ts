import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { toUser } from '../utils/utils';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = toUser(req.body);

    if (password !== req.body.confirmPassword) {
      res.render('register', { message: 'Passwords does not match', messageClass: 'alert-danger' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    if (error.code === 11000) {
      error.message = 'Username already exists';
    }
    return next(error);
  }
};
