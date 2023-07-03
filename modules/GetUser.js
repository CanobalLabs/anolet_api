const User = require("../models/user.js");
const CanobalUser = require("../models/canobalUser.js");

async function getUser(id, type) {
    if (!await CanobalUser.findOne({ id: id })) return null;
    if (type == "anolet") return await User.findOne({ id: id });
    if (type == "canobal") return await CanobalUser.findOne({ id: id });
    if (type == "both") return Object.assign(
        ...JSON.parse(
            JSON.stringify(
                await Promise.all([
                    User.findOne({ id: id }),
                    CanobalUser.findOne({ id: id })
                ])
            ))
        ); // Why we have to use JSON.parse -> JSON.stringify: https://stackoverflow.com/a/50520945/14361781
}

module.exports = getUser