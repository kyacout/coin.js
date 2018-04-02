const mongoose = require('mongoose');

const Transaction = mongoose.model('Transaction');

async function newTxn(txnKey, getTxnBody) {
  try {
    const txn = await Transaction.findOne({ key: txnKey });
    if (!txn) {
      getTxnBody(txnKey);
    }
  } catch (e) {
    console.error(e);
  }
}

function saveNewTransaction(txn) {
  Transaction.create(txn).catch((e) => { console.error(e); });
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`a user connected: ${socket}`);

    socket.on('newTxn', newTxn);
    socket.on('txnBody', saveNewTransaction);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};
