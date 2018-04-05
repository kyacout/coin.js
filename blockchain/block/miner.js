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
const BlockchainState = mongoose.model('BlockchainState');

function structureBlockHeader(block) {
  return [
    block.header.version,
    block.header.prevKey,
    block.header.mroot,
    block.header.height,
    JSON.stringify(block.header.payload),
    block.header.author,
  ];
}

async function createJWK(key) {
  const k = key;
  k.crv = 'P-256';
  k.kty = 'EC';
  const generatedKey = await jose.JWK.asKey(k);
  return generatedKey;
}

function keyFromAddress(address) {
  return {
    x: address.substring(0, address.length / 2),
    y: address.substring(address.length / 2),
  };
}

function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

/*
  - Choose one transaction for each payer.
  - That transaction's nonce must equal the payee's transaction count.
*/
async function createBlock() {
  try {
    let unminedTransactions = await Transaction.find({ mined: false }).sort('from');
    if (unminedTransactions.length > 0) {
      const acceptedPayers = new Set();
      const payerAccounts = await (async (trxs) => {
        const pa = {};
        for (let trx of trxs) {
          try {
            pa[trx.from] = await Account.findOne({ address: trx.from });
          } catch (e) {
            console.log(e);
            throw e;
          }
        }
        return pa;
      })(unminedTransactions);

      for (let i = 0; i < unminedTransactions.length; i += 1) {
        if (unminedTransactions[i].from && !acceptedPayers.has(unminedTransactions[i].from)) {
          const payerKey = unminedTransactions[i].from;
          if (payerAccounts[payerKey].txCount != unminedTransactions[i].nonce ||
            payerAccounts[payerKey].coins < unminedTransactions[i].amount) {

            delete unminedTransactions[i];
          } else {
            acceptedPayers.add(unminedTransactions[i].from);
          }
        } else {
          delete unminedTransactions[i];
        }
      }

      unminedTransactions = cleanArray(unminedTransactions);
      if (unminedTransactions.length > 0) {
        const lastBlock = await Block.findOne().sort('-header.height');

        // add reward transaction
        let rewardTrx = new Transaction({ to: wallet.account.address, amount: 100 });
        rewardTrx.key = await wallet.signTransaction(rewardTrx);
        rewardTrx.nonce = lastBlock.header.height + 1;
        rewardTrx = await rewardTrx.save();
        unminedTransactions.unshift(rewardTrx);

        // create merkle root
        let transactionKeys = unminedTransactions.map(trxn => trxn.key);
        let mroot = Buffer.concat(transactionKeys);
        const hash = crypto.createHash('sha256');
        mroot = hash.update(JSON.stringify(mroot)).digest();

        return {
          header: {
            version: config.version,
            prevKey: lastBlock.key,
            mroot,
            height: lastBlock.header.height + 1,
            payload: {},
            author: wallet.account.address,
          },
          txs: transactionKeys,
          createdAt: Date.now(),
        };
      }
    }
    return undefined;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

async function verifyBlock(block) {
  try {
    let isValid = true;

    await block.txs.forEach(async (txKey) => {
      try {
        const tx = await Transaction.findOne({ key: txKey });
        if (!tx || tx.amount <= config.minAmount) {
          isValid = false;
        }

        const payer = await Account.findOne({ address: tx.from });
        if (!payer || payer.coins < tx.amount || payer.txCount !== tx.nonce) {
          isValid = false;
        }
      } catch (e) {
        throw e;
      }
    });
    return isValid;
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

async function verifyBlockSignature(block) {
  const doc = structureBlockHeader(block);
  const hash = crypto.createHash('sha256');
  const buf = hash.update(JSON.stringify(doc)).digest();

  try {
    const generatedKey = await createJWK(keyFromAddress(block.header.author));
    const verifiedDoc = await generatedKey.verify('ES256', buf, block.key);
    return verifiedDoc.valid;
  } catch (e) {
    console.error(`Could not verify block signature: ${e}`);
    return false;
  }
}

async function processBlockchain(height) {
  // TODO
}

async function processBlock(block) {
  try {
    await BlockchainState.update({}, { $set: { clean: false } });

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

    await BlockchainState.update({}, { $set: { clean: true, block: block.key } });
  } catch (e) {
    throw e;
  }
}

async function broadcastBlock(block) {

}

async function checkCleanBlockchain() {
  const bcState = await BlockchainState.findOne({});
  const lastBlock = await Block.findOne().sort('-header.height');

  if (!bcState) {
    bcState = await BlockchainState.create({ clean: false });
  }
  if (!bcState.clean || (bcState.clean && bcState.block != lastBlock.key)) {
    processBlockchain();
  }
}

module.exports.init = async () => {
  await checkCleanBlockchain();

  const count = await Block.count();
  if (count === 0) {
    await Transaction.create(genesis.TRX);
    await Block.create(genesis.BLOCK);
    await processBlock(genesis.BLOCK);
  }
};

module.exports.mine = async () => {
  let blockJson = {};
  try {
    await checkCleanBlockchain();

    blockJson = await createBlock();
    const validBlock = await verifyBlock(blockJson);
    if (validBlock) {
      const sign = await signBlock(blockJson);
      blockJson.key = sign;

      await Block.create(blockJson);
      await broadcastBlock(blockJson);
      await processBlock(blockJson);
    }
  } catch (e) {
    console.error(e);
  }
};
