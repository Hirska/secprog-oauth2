import app from './app';
import http = require('http');

const port = process.env.PORT;
if (!port) {
  process.exit(1);
}

http.createServer(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
