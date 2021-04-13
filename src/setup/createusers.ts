import User from '../models/user';
import { IUser, UserRole } from '../types';

export default async (userConfig: IUser) => {
  const admin = await User.findOne({ role: UserRole.admin });

  if (admin) {
    return 'Admin not created: at least one admin user already found in database.';
  }

  const user = new User(userConfig);
  user.role = UserRole.admin;
  await user.save();
  return 'Admin user successfully created';
};
