const Mux = require('@mux/mux-node');

const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env;

exports.getMux = () =>
  new Mux({
    tokenId: MUX_TOKEN_ID,
    tokenSecret: MUX_TOKEN_SECRET,
  });
