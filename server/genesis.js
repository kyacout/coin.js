module.exports.TRX = {
  key: Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64'),
  to: '1xfanZOtYUB8euh1COQbodl_7H03sie2heSxWq25W2IxNwlTcf969gWVKsYCuzjuWvOB9VVZrBEoT7e4rTnO54',
  amount: 100,
  nonce: 0,
  payload: {
    message: 'First 100 coins.js tokens ever created!',
  },
};

module.exports.BLOCK = {
  key: Buffer.from('WLjk1G94iMZbA4yB6FmXKqb7Ia/Ki1oviFMNy15Tu0UTtemhuoRyBSpKz+/Zliy53l7W0i5QY8g5+P/tP/6ytg==', 'base64'),
  header: {
    version: '0.0.1',
    prevKey: Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64'),
    mroot: Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64'),
    height: 0,
    payload: {
      miners: [
        '1xfanZOtYUB8euh1COQbodl_7H03sie2heSxWq25W2IxNwlTcf969gWVKsYCuzjuWvOB9VVZrBEoT7e4rTnO54',
      ],
    },
    author: Buffer.from('1xfanZOtYUB8euh1COQbodl_7H03sie2heSxWq25W2IxNwlTcf969gWVKsYCuzjuWvOB9VVZrBEoT7e4rTnO54'),
  },
  txs: [
    Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64'),
  ],
};
