import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import exphbs from 'express-handlebars';
import handleError from './utils/errorHandler';
import controllers from './controllers';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { connectToDB } from './db';

const app = express();
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const swaggerDocument = YAML.load(`${__dirname}/../openapi.yaml`);

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
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', controllers);
app.use((_req, res) => {
  res.sendStatus(404);
});

app.use(handleError);

export default app;
