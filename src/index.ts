import app from './app';
import https = require('https');
import settings from './utils/settings';
import fs from 'fs';

const port = settings.PORT;

https
  .createServer(
    {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      passphrase: settings.PASSPHRASE
    },
    app
  )
  .listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
