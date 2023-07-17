"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const user_1 = require("../models/user");
const canobalUser_1 = require("../models/canobalUser");
async function getUser(id, type) {
    if (!await canobalUser_1.CanobalUser.findOne({ id: id }))
        return null;
    if (type == "anolet")
        return await user_1.User.findOne({ id: id });
    if (type == "canobal")
        return await canobalUser_1.CanobalUser.findOne({ id: id });
    if (type == "both") { }
    if (type == "both") {
        return Object.assign(
        // todo: fix this
        // @ts-ignore
        ...JSON.parse(JSON.stringify(await Promise.all([
            user_1.User.findOne({ id: id }),
            canobalUser_1.CanobalUser.findOne({ id: id })
        ]))));
    } // Why we have to use JSON.parse -> JSON.stringify: https://stackoverflow.com/a/50520945/14361781
}
exports.getUser = getUser;
