import app from './app';
import https = require('https');
import settings from './utils/settings';
import fs from 'fs';

const port = settings.PORT;

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: settings.PASSPHRASE
};
https.createServer(options, app).listen(port, () => {
  console.log(`Server running on port ${port}`);
});
