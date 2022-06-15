const cryptr = require('./Cryptr');
module.exports = function GenerateToken(id) {
    return "YT/XK1ctsfM7FI-" + cryptr.encrypt(id);
}