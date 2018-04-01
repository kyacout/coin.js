require('./server/index');
const { Console } = require('console');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const routes = require('./server/routes');
require('./server/wallet/wallet');
const wallet = require('./server/wallet/wallet');
const bodyParser = require('body-parser');

const PORT = 3000;

async function initApp() {
  const logger = new Console(process.stdout, process.stderr);

  try {
    mongoose.Promise = global.Promise;
    await mongoose.connect('mongodb://localhost/blockchainDb');

    await wallet.init();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    routes(app);

    app.use((req, res) => {
      res.status(404).send({ url: `${req.originalUrl} not found` });
    });

    io.on('connection', (socket) => {
      logger.log(`a user connected: ${socket}`);
      socket.on('disconnect', () => {
        logger.log('user disconnected');
      });
    });

    app.listen(PORT, () => logger.log(`Coin.js node successfuly started on: ${PORT}`));
  } catch (e) {
    logger.log(e);
  }
}

initApp();
