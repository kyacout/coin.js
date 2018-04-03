const mongoose = require('mongoose');

const headerSchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true,
  },
  prevKey: {
    type: Buffer,
    required: true,
  },
  mroot: {
    type: Buffer,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  payload: {
    type: {},
  },
  author: {
    type: Buffer,
    required: true,
  },
});

const blockSchema = new mongoose.Schema({
  key: {
    type: Buffer,
    required: true,
    unique: true,
  },
  header: {
    type: headerSchema,
    required: true,
  },
  txs: {
    type: [Buffer],
    required: true,
  },
  createdAt: {
    type: Date,
  },
});

blockSchema.statics.lastBlock = async () => this.findOne().sort('-header.height');

module.exports = mongoose.model('Block', blockSchema);
