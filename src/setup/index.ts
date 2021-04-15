import createUser from './createusers';
import createclient from './createclient';
import createscope from './createscope';
import { UserRole } from '../types';
import settings from '../utils/settings';

export default async () => {
  console.log(
    await createUser({
      email: settings.ADMIN_EMAIL,
      password: settings.ADMIN_PASSWORD,
      role: UserRole.admin
    })
  );

  console.log(
    await createclient({
      clientSecret: settings.CLIENT_SECRET,
      redirectUrls: [settings.CLIENT_REDIRECT_URL],
      isConfidential: true
    })
  );

  console.log(await createscope({ scope: 'profile', description: 'This gives access to your profile information' }));
};
