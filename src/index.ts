import app from './app';
import http = require('http');
import settings from './utils/settings';

const port = settings.PORT;

http.createServer(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
