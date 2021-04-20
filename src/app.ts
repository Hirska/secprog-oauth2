import mongoose from 'mongoose';
import express from 'express';
import helmet from 'helmet';
import exphbs from 'express-handlebars';
import cors from 'cors';
import handleError from './utils/errorHandler';
import controller from './controllers';
import path from 'path';
import setup from './setup';
import settings from './utils/settings';

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

const MONGODB_URI = settings.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDb');
    setup()
      .then(() => console.log('Setup finished'))
      .catch((error) => console.log(error));
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use('/', controller);
app.use(handleError);

export default app;
