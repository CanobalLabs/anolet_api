"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUsername = void 0;
const canobalUser_1 = require("../models/canobalUser");
async function checkUsername(username) {
    return canobalUser_1.CanobalUser.findOne({ "username": { $regex: new RegExp(username, "i") } }, "id").then(response => {
        return response == null ? false : response.id;
    });
}
exports.checkUsername = checkUsername;
