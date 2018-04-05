const io = require('socket.io-client');
const mongoose = require('mongoose');
const nwInterfaces = require('os').networkInterfaces;
const config = require('../config');
const trxController = require('./transaction/transactionController');

const Transaction = mongoose.model('Transaction');

function getLocalExternalIP() {
  return [].concat(...Object.values(nwInterfaces()))
  .filter(details => details.family === 'IPv4' && !details.internal)
  .pop().address;
}

module.exports.init = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    initSocket(socket);
  });

  module.exportsconfig.knownNodes.forEach((node) => {
    if (node.ip != getLocalExternalIP()) {
      const socket = io.connect(`http://${node.ip}:${node.port}`);
      initSocket(socket);
    }
  });
}

function initSocket(socket) {
  socket.on('newTxn', () => { console.log('Received transaction!'); });
  socket.on('txnBody', saveNewTransaction);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}

async function getTxnBody(txnKey) {
  const newTxn = await Transaction.findOne({ key: txnKey });
  console.log('Sending transaction body ...');
  socket.emit('txnBody', trxController.formatTransaction(newTxn));
}

module.exports.broadcastTransaction = (txnKey) => {
  console.log(`Broadcasting new transaction: ${txnKey.toString('base64')}`);
  socket.emit('newTxn', txnKey, getTxnBody);
};






















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
