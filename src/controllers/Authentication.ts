import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { DocumentUser } from '../types';
import { toUser } from '../utils/utils';

const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = toUser(req.body);
    const user: DocumentUser | null = await User.findOne({ username });
    if (!user) {
      throw new Error('probleema');
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new Error('probleema');
    }
    res.status(200).send();
  } catch (error) {
    return next(error);
  }
};

const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = toUser(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
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

const registerClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = toUser(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
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

export default {
  authenticate,
  register,
  registerClient
};
