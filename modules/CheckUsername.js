const User = require("../models/canobalUser.js");

async function checkUsername(username) {
    return User.findOne({ "username": { $regex: new RegExp(username, "i") } }, "id").then(response => {
        return response == null ? false : response.id;
    });
}

module.exports = checkUsername