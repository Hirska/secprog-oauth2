import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import exphbs from 'express-handlebars';
import cors from 'cors';
import handleError from './utils/errorHandler';
import controller from './controllers';
import createUser from './setup/createusers';
import { UserRole } from './types';
import createclient from './setup/createclient';
import path from 'path';

dotenv.config();
const app = express();

/**
 * Define template engine
 */
app.set('views', path.join(__dirname, 'views'));
app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
  })
);
app.set('view engine', 'hbs');

/**
 * Variables
 */
if (
  !process.env.MONGODB_URI ||
  !process.env.ADMIN_USERNAME ||
  !process.env.ADMIN_PASSWORD ||
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.CLIENT_REDIRECT_URL
) {
  process.exit(1);
}

const MONGODB_URI: string = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDb');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

void createUser({
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD,
  role: UserRole.admin
});

void createclient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUris: [process.env.CLIENT_REDIRECT_URL]
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/oauth', controller);
app.use(handleError);

export default app;
