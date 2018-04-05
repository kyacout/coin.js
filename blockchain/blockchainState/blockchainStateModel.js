const mongoose = require('mongoose');

const blockchainStateSchema = new mongoose.Schema({
  clean: {
    type: Boolean,
    required: true,
  },
  block: {
    type: Buffer,
  }
});

module.exports = mongoose.model('BlockchainState', blockchainStateSchema);
