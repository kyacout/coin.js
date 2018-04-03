const mongoose = require('mongoose');
const jose = require('node-jose');
const crypto = require('crypto');
const { Console } = require('console');

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

function structureTransaction(transaction) {
  return {
    from: transaction.from,
    to: transaction.to,
    amount: transaction.amount,
    nonce: transaction.nonce,
    payload: transaction.payload,
  };
}

class Wallet {
  constructor() {
    this.WalletKey = mongoose.model('WalletKey');
    this.Account = mongoose.model('Account');
    this.logger = new Console(process.stdout, process.stderr);
    this.account = {};
  }

  async init() {
    try {
      let key = await this.WalletKey.findOne({}, 'x y');
      if (!key) {
        const keystore = jose.JWK.createKeyStore();
        await keystore.generate('EC', 'P-256');
        key = await this.WalletKey.create(keystore.toJSON(true).keys[0]);
      }

      const address = key.x + key.y;
      this.account = await this.Account.findOne({ address });
      if (!this.account) {
        this.account = await this.Account.create({ address });
      }
      console.log(`Your public address is: ${this.account.address}`);
    } catch (e) {
      this.logger.error(e);
    }
  }

  async signTransaction(transaction) {
    const doc = structureTransaction(transaction);
    const hash = crypto.createHash('sha256');
    let buf = hash.update(JSON.stringify(doc));
    buf = buf.digest();

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

  async verifyTransaction(transaction) {
    const doc = structureTransaction(transaction);
    const hash = crypto.createHash('sha256');
    let buf = hash.update(JSON.stringify(doc));
    buf = buf.digest();

    try {
      const generatedKey = await createJWK(keyFromAddress(transaction.from));
      const verifiedDoc = await generatedKey.verify('ES256', buf, transaction.key);
      return verifiedDoc.valid;
    } catch (e) {
      this.logger.error(`Could not verify transaction: ${e}`);
      return false;
    }
  }
}

module.exports = new Wallet();
