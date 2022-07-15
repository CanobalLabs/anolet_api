module.exports = function GenerateToken(id) {
    return "YT/XK1ctsfM7FI-" + require('./Cryptr').encrypt(id);
}