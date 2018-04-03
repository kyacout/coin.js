const mongoose = require('mongoose');

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
