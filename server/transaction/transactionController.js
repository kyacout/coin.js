const mongoose = require('mongoose');
const wallet = require('../wallet/wallet');

const Transaction = mongoose.model('Transaction');

function formatTransaction(transaction) {
  return {
    key: transaction.key.toString('hex'),
    from: transaction.from,
    to: transaction.to,
    amount: transaction.amount,
    nonce: transaction.nonce,
    payload: transaction.payload,
  };
}

exports.readTransaction = async (req, response) => {
  try {
    const transaction = await Transaction.find({ key: req.params.blockKey });
    response.json(transaction);
  } catch (e) {
    response.send(e);
  }
};

exports.newTransaction = async (req, response) => {
  const transaction = new Transaction(req.body);
  transaction.from = wallet.account.address;
  transaction.nonce = wallet.account.txn;

  try {
    const signature = await wallet.signTransaction(transaction);
    transaction.key = signature;
    await transaction.save();
    response.send(formatTransaction(transaction));
  } catch (e) {
    response.send(e);
  }
};