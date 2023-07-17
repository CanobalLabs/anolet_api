"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateToken = void 0;
function GenerateToken(id, vendor) {
    return "YT/XK1ctsfM7FI~" + require('./Cryptr').encrypt(id + "~" + vendor);
}
exports.GenerateToken = GenerateToken;
