module.exports.TRX = {
  key: Buffer.from('g4Xd+yDiyuUopc6oKVtYM1Af0sYW4LOm8zfH0eVn9y+T1pZDHNuMcxc8gi2bSMImEiGOdo9uTLxdXlFOuoY7tg==', 'base64'),
  to: '1xfanZOtYUB8euh1COQbodl_7H03sie2heSxWq25W2IxNwlTcf969gWVKsYCuzjuWvOB9VVZrBEoT7e4rTnO54',
  amount: 100,
  nonce: 0,
  payload: {
    message: 'First 100 coins.js tokens ever created!',
  },
  mined: true,
  block: Buffer.from('D5ul9QXjesrY9TYkyeXpJhu3MOiMsYjGixYKhr9EwILB05S0Y+X4X0/Z2LqH/gLyJ1RKlL7x8JQpcw/08mE03Q==', 'base64'),
};

module.exports.BLOCK = {
  key: Buffer.from('D5ul9QXjesrY9TYkyeXpJhu3MOiMsYjGixYKhr9EwILB05S0Y+X4X0/Z2LqH/gLyJ1RKlL7x8JQpcw/08mE03Q==', 'base64'),
  header: {
    version: '0.0.1',
    prevKey: Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64'),
    mroot: Buffer.from('g4Xd+yDiyuUopc6oKVtYM1Af0sYW4LOm8zfH0eVn9y+T1pZDHNuMcxc8gi2bSMImEiGOdo9uTLxdXlFOuoY7tg==', 'base64'),
    height: 0,
    payload: {
      miners: [
        '1xfanZOtYUB8euh1COQbodl_7H03sie2heSxWq25W2IxNwlTcf969gWVKsYCuzjuWvOB9VVZrBEoT7e4rTnO54',
      ],
    },
    author: '1xfanZOtYUB8euh1COQbodl_7H03sie2heSxWq25W2IxNwlTcf969gWVKsYCuzjuWvOB9VVZrBEoT7e4rTnO54',
  },
  txs: [
    Buffer.from('g4Xd+yDiyuUopc6oKVtYM1Af0sYW4LOm8zfH0eVn9y+T1pZDHNuMcxc8gi2bSMImEiGOdo9uTLxdXlFOuoY7tg==', 'base64'),
  ],
};
