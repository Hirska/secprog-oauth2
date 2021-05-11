import User from '../models/user';
import { IUser, UserRole } from '../types';

export default async (userConfig: IUser) => {
  const admin = await User.findOne({ role: UserRole.admin });

  if (admin) {
    return;
  }

  const user = new User(userConfig);
  user.role = UserRole.admin;
  await user.save();
  console.log('Admin user successfully created');
  return;
};
