const mongoose = require('mongoose');

const walletKeySchema = new mongoose.Schema({
  x: {
    type: String,
    required: true,
  },
  y: {
    type: String,
    required: true,
  },
  d: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('WalletKey', walletKeySchema);
