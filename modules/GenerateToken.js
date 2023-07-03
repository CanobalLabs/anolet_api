module.exports = function GenerateToken(id, vendor) {
    return "YT/XK1ctsfM7FI~" + require('./Cryptr').encrypt(id + "~" + vendor);
}