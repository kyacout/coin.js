const mongoose = require('mongoose');
const config = require('../../config');

const transactionSchema = new mongoose.Schema({
  key: {
    type: Buffer,
    required: true,
    unique: true,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: config.minAmount,
  },
  nonce: {
    type: Number,
    required: true,
  },
  payload: {
    type: {},
  },
  mined: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Buffer,
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
