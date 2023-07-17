"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cryptr = void 0;
const Crypt = require('cryptr');
exports.Cryptr = new Crypt(process.env.HASH);
