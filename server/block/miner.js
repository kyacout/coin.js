const crypto = require('crypto');
const jose = require('node-jose');
const mongoose = require('mongoose');
const genesis = require('../genesis');
const config = require('../../config');
const wallet = require('../wallet/wallet');

const Transaction = mongoose.model('Transaction');
const Block = mongoose.model('Block');
const Account = mongoose.model('Account');
const WalletKey = mongoose.model('WalletKey');

function structureBlockHeader(block) {
  return {
    version: block.header.version,
    prevKey: block.header.prevKey,
    mroot: block.header.mroot,
    height: block.header.height,
    payload: block.header.payload,
    author: block.header.author,
  };
}

async function createJWK(key) {
  const k = key;
  k.crv = 'P-256';
  k.kty = 'EC';
  const generatedKey = await jose.JWK.asKey(k);
  return generatedKey;
}

async function createBlock() {
  try {
    const unminedTransactions = await Transaction.find({ mined: false }, { trx: 1 });
    if (unminedTransactions.length > 0) {
      // create merkle root
      const transactionKeys = unminedTransactions.map(trxn => trxn.key);
      let mroot = Buffer.concat(transactionKeys);
      const hash = crypto.createHash('sha256');
      mroot = hash.update(JSON.stringify(mroot)).digest();

      const lastBlock = await Block.findOne().sort('-header.height');

      return {
        header: {
          version: config.version,
          prevKey: lastBlock.key,
          mroot,
          height: lastBlock.height + 1,
          payload: {},
          author: wallet.account.address,
        },
        txs: transactionKeys,
        createdAt: Date.now(),
      };
    }
    return undefined;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function verifyBlock(block) {
  try {
    const isValids = block.txs.map(async (txKey) => {
      const tx = await Transaction.findOne({ key: txKey });
      if (!tx || tx.amount <= 0) {
        return false;
      }

      const payer = await Account.findOne({ address: tx.from });
      if (!payer || payer.coins < tx.amount || payer.txCount !== tx.nonce) {
        return false;
      }
      return true;
    });
    return isValids.every(e => e);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function signBlock(block) {
  const doc = structureBlockHeader(block);
  const hash = crypto.createHash('sha256');
  const buf = hash.update(JSON.stringify(doc)).digest();

  try {
    const key = await WalletKey.findOne({});
    const generatedKey = await createJWK(key);
    const signed = await generatedKey.sign('ES256', buf);
    return signed.mac;
  } catch (e) {
    console.error(`Could not sign block: ${e}`);
    return undefined;
  }
}

async function revertBlock(block) {
  // TODO
}

async function processBlock(block) {
  try {
    block.txs.forEach(async (txKey) => {
      const tx = await Transaction.findOne({ key: txKey });

      // not a reward transaction
      if (tx.from) {
        const payer = await Account.findOne({ address: tx.from });
        payer.set({ coins: payer.coins - tx.amount, txCount: payer.txCount + 1 });
        await payer.save();
      }
      let payee = await Account.findOne({ address: tx.to });
      if (!payee) {
        payee = await Account.create({ address: tx.to });
      }
      payee.set({ coins: payee.coins + tx.amount });
      await payee.save();

      tx.set({ mined: true, block: block.key });
      await tx.save();
    });
  } catch (e) {
    throw e;
  }
}

async function broadcastBlock(block) {

}

module.exports.init = async () => {
  const count = await Block.count();
  if (count === 0) {
    await Transaction.create(genesis.TRX);
    await processBlock(genesis.BLOCK);
    await Block.create(genesis.BLOCK);
  }
};

module.exports.mine = async () => {
  let blockJson = {};
  try {
    blockJson = await createBlock();
    const validBlock = await verifyBlock(blockJson);
    if (validBlock) {
      const sign = await signBlock(blockJson);
      blockJson.key = sign;

      await processBlock(blockJson);
      await Block.create(blockJson);
      await broadcastBlock(blockJson);
    }
  } catch (e) {
    console.error(e);
    await revertBlock(blockJson);
  }
};
