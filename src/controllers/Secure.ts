import { Response, Request, NextFunction } from 'express';
import User from '../models/user';
import { emailSchema } from '../utils/parse';

export const modifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = emailSchema.safeParse(req.body.email);
    if (!result.success) {
      return res.status(400).json('Invalid email');
    }
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(400).json('Invalid token');
    }
    user.email = result.data;
    await user.save();
    return res.json({ email: user.email });
  } catch (error) {
    return next(error);
  }
};
