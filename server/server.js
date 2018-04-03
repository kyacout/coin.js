const mongoose = require('mongoose');

const Transaction = mongoose.model('Transaction');

async function newTxn(txnKey, getTxnBody) {
  console.log('Received new transaction ..');
  try {
    const txn = await Transaction.findOne({ key: txnKey });
    if (!txn) {
      console.log('Getting transaction body ..');
      getTxnBody(txnKey);
    }
  } catch (e) {
    console.error(e);
  }
}

function saveNewTransaction(txn) {
  const temp = txn;
  temp.key = Buffer.from(txn.key, 'base64');
  Transaction.create({ trx: temp }).catch((e) => { console.error(e); });
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    inConnections[socket.id] = socket;
    console.log(`User connected: ${socket.id}`);

    socket.on('newTxn', () => { console.log('Received transaction!'); });
    socket.on('txnBody', saveNewTransaction);
    socket.on('disconnect', () => {
      delete inConnections[socket.id];
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
