import express from 'express';
import exphbs from 'express-handlebars';

const app = express();
app.engine(
  'hbs',
  exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
  })
);
app.set('view engine', 'hbs');

app.use(express.json());

const PORT = 3000;

app.get('/', (_req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
