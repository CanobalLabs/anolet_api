const User = require("../models/canobalUser.js");

async function checkUsername(username) {
    return User.findOne({ "username": { $regex: new RegExp(username, "i") } }, "id").then(response => {
        if (response == null) return false;
        if (response != null) return response.id;
    });
}

module.exports = checkUsername