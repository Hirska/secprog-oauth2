import { DocumentClient, DocumentUser, UserRole } from '../types';
import Client from '../models/client';
import User from '../models/user';
import { v4 as uuidv4 } from 'uuid';
const clients = [
  {
    redirectUrls: ['https://oauthdebugger.com/debug'],
    clientName: 'OAuth Debugger',
    isConfidential: true,
    //clientSecret: 'secret',
    clientId: uuidv4()
  },
  {
    redirectUrls: ['http://localhost:3000/callback', 'http://localhost:3000/anothercallback'],
    clientName: 'Localhost test',
    isConfidential: false,
    clientId: uuidv4()
  }
];

export default async () => {
  const client: DocumentClient | null = await Client.findOne({});
  const user: DocumentUser | null = await User.findOne({ role: UserRole.admin });

  if (client) {
    return 'Client already exists';
  }
  if (!user) {
    return 'User not created';
  }

  await Client.create(clients);
  return 'Client user successfully created';
};
