const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.HASH);
module.exports = cryptr