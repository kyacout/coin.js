const { Console } = require('console');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nwInterfaces = require('os').networkInterfaces;

require('./server/index');
const routes = require('./server/routes');
const wallet = require('./server/wallet/wallet');
const server = require('./server/server');

const PORT = 3322;

module.exports.getLocalExternalIP = () => [].concat(...Object.values(nwInterfaces()))
  .filter(details => details.family === 'IPv4' && !details.internal)
  .pop().address;

(async () => {
  const logger = new Console(process.stdout, process.stderr);
  mongoose.Promise = global.Promise;
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  routes(app);
  server(io);

  try {
    await mongoose.connect('mongodb://localhost/blockchainDb');
    await wallet.init();
    http.listen(PORT, () => logger.log(`Coin.js node successfuly started on: ${PORT}`));
  } catch (e) {
    logger.error(e);
  }
})();
