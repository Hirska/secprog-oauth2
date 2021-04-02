import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { DocumentUser } from '../types';
import { toUser } from '../utils/utils';

const token = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export default {
  token
};
