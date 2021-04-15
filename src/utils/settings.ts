import env from 'env-var';
import dotenv from 'dotenv';
dotenv.config();

export default {
  MONGODB_URI: env.get('MONGODB_URI').required().asString(),
  PORT: env.get('PORT').required().asInt(),
  ADMIN_EMAIL: env.get('ADMIN_EMAIL').required().asString(),
  ADMIN_PASSWORD: env.get('ADMIN_PASSWORD').required().asString(),

  CLIENT_SECRET: env.get('CLIENT_SECRET').required().asString(),
  CLIENT_REDIRECT_URL: env.get('CLIENT_REDIRECT_URL').required().asString(),

  JWT_SECRET: env.get('JWT_SECRET').required().asString(),
  JWT_LIFETIME: env.get('JWT_LIFETIME').required().asInt()
};
