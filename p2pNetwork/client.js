const io = require('socket.io-client');
const mongoose = require('mongoose');

const trxController = require('./../server/transaction/transactionController');

const Transaction = mongoose.model('Transaction');
const socket = io.connect('http://18.188.181.223:3322');

async function getTxnBody(txnKey) {
  const newTxn = await Transaction.findOne({ key: txnKey });
  console.log('Sending transaction body ...');
  socket.emit('txnBody', trxController.formatTransaction(newTxn));
}

module.exports.broadcastTransaction = (txnKey) => {
  console.log(`Broadcasting new transaction: ${txnKey.toString('base64')}`);
  socket.emit('newTxn', txnKey, getTxnBody);
};
