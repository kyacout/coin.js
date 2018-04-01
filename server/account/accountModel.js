const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  txn: {
    type: Number,
    required: true,
    default: 0,
  },
  coins: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('Account', accountSchema);
