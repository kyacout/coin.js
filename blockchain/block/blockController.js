const mongoose = require('mongoose');

const Block = mongoose.model('Block');

exports.readBlock = async (req, res) => {
  try {
    const block = await Block.find({ key: req.params.key });
    res.json(block);
  } catch (e) {
    res.send(e);
  }
};
