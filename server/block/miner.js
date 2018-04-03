const crypto = require('crypto');
const mongoose = require('mongoose');

const Transaction = mongoose.model('Transaction');
const Block = mongoose.model('Block');

async function createBlock() {
  const unminedTransactions = await Transaction.find({ mined: false }, { trx: 1 });
  if (unminedTransactions.length > 0) {
    let blockJson = {};

    // create merkle root
    const transactionKeys = unminedTransactions.map(trxn => trxn.key);
    let mroot = Buffer.concat(transactionKeys);
    const hash = crypto.createHash('sha256');
    mroot = hash.update(JSON.stringify(mroot)).digest();


  }
}

function verifyBlock(block) {

}

function runBlock(block) {

}

async function signBlock(block) {
  const doc = structureTransaction(transaction);
  const hash = crypto.createHash('sha256');
  const buf = hash.update(JSON.stringify(doc)).digest();

  try {
    const key = await this.WalletKey.findOne({});
    const generatedKey = await createJWK(key);
    const signed = await generatedKey.sign('ES256', buf);
    return signed.mac;
  } catch (e) {
    this.logger.error(`Could not sign transaction: ${e}`);
    return undefined;
  }
}

async function broadcastBlock(block) {

}

module.exports.init = async () => {
  if (Block.)
};

module.exports.mine = async () => {
  try {
    const blockJSON = await createBlock();
    const validBlock = await verifyBlock(blockJSON);
    if (validBlock) {
      const newBlock = await signBlock(blockJSON);
      await broadcastBlock(newBlock);
    }
  } catch (e) {
    console.error(e);
  }
};
