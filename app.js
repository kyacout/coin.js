const { Console } = require('console');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

require('./blockchain/index');
const routes = require('./blockchain/routes');
const wallet = require('./blockchain/wallet/wallet');
const p2p = require('./blockchain/p2pConnections');
const miner = require('./blockchain/block/miner');

const PORT = 3322;

(async () => {
  const logger = new Console(process.stdout, process.stderr);
  mongoose.Promise = global.Promise;
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  routes(app);

  try {
    await mongoose.connect('mongodb://localhost/blockchainDb');
    await wallet.init();
    await miner.init();
    http.listen(PORT, () => logger.log(`Coin.js node successfuly started on: ${PORT}`));
    p2p.init(io);
  } catch (e) {
    logger.error(e);
  }
})();
