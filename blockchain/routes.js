const blockController = require('./block/blockController');
const transactionController = require('./transaction/transactionController');

module.exports = (app) => {
  app.route('/blocks/:key')
    .get(blockController.readBlock);
  app.route('/trx/:key')
    .get(transactionController.readTransaction);
  app.route('/trx/')
    .post(transactionController.newTransaction);

  app.use((req, res) => {
    res.status(404).send({ url: `${req.originalUrl} not found` });
  });
};
