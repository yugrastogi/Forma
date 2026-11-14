const path = require('path');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const { initSocket } = require('./socket');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
