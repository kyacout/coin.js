const io = require('socket.io-client');
const mongoose = require('mongoose');

const Transaction = mongoose.model('Transaction');
const socket = io.connect('http://18.188.181.223:3322');
socket.disconnect();

async function getTxnBody(txnKey) {
  const newTxn = await Transaction.findOne({ key: txnKey });
  console.log('Sending transaction body ...');
  socket.emit('txnBody', newTxn);
}

module.exports.broadcastTransaction = (txnKey) => {
  console.log(`Broadcasting new transaction: ${txnKey}`);
  socket.emit('newTxn', txnKey, getTxnBody);
};
