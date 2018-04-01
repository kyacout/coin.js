const mongoose = require('mongoose');

const Block = mongoose.model('Block');

exports.readBlock = (req, res) => {
  Block.find({ key: req.params.key }, (err, task) => {
    if (err) { res.send(err); }
    res.json(task);
  });
};
