import User from '../models/user';
import { IUser, UserRole } from '../types';
import bcrypt from 'bcrypt';

export default async (userConfig: IUser) => {
  const admin = await User.findOne({ role: UserRole.admin });

  if (admin) {
    return 'Admin not created: at least one admin user already found in database.';
  }

  // FIXME: Fails when a non-admin user with same email already exists in the database

  const user = new User({ ...userConfig, password: await bcrypt.hash(userConfig.password, 10) });
  user.role = UserRole.admin;
  await user.save();
  return 'Admin user successfully created';
};
