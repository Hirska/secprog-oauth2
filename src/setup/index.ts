import createUser from './createusers';
//import createclient from './createclient';
import createscopes from './createscopes';
import { UserRole } from '../types';
import settings from '../utils/settings';

export default async () => {
  await createUser({
    email: settings.ADMIN_EMAIL,
    password: settings.ADMIN_PASSWORD,
    role: UserRole.admin
  });

  await createscopes();
};
