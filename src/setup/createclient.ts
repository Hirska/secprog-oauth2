import { IClient, DocumentClient, DocumentUser, UserRole } from '../types';
import Client from '../models/client';
import User from '../models/user';

export default async (clientConfig: Omit<IClient, 'user'>) => {
  const client: DocumentClient | null = await Client.findOne({});
  const user: DocumentUser | null = await User.findOne({ role: UserRole.admin });
  if (client) {
    return 'Client not created as atleast one is in database';
  }
  if (!user) {
    return 'User not created';
  }

  // FIXME: Fails when a non-admin user with same email already exists in the database

  const newClient = new Client({ ...clientConfig, user: user.id as string });
  await newClient.save();
  return 'Client user successfully created';
};
