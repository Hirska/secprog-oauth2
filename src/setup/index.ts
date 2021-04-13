import createUser from './createusers';
import createclient from './createclient';
import createscope from './createscope';
import { UserRole } from '../types';

export default async () => {
  /**
   * Variables
   */
  if (
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD ||
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.CLIENT_REDIRECT_URL
  ) {
    process.exit(1);
  }
  console.log(
    await createUser({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      role: UserRole.admin
    })
  );

  console.log(
    await createclient({
      clientSecret: process.env.CLIENT_SECRET,
      redirectUrls: [process.env.CLIENT_REDIRECT_URL],
      isConfidential: true
    })
  );

  console.log(await createscope());
};
