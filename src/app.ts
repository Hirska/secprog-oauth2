import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import handleError from './utils/errorHandler';
import controllers from './controllers';
import path from 'path';
import { connectToDB } from './db';

const app = express();

connectToDB();

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

app.use(morgan('tiny'));
app.use('/', controllers);
app.use((_req, res) => {
  res.sendStatus(404);
});

app.use(handleError);

export default app;
