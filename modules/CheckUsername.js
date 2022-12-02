const User = require("../models/user.js");

async function checkUsername(username) {
    return User.findOne({ "username": { $regex: new RegExp(username, "i") } }).then(response => {
        if (response == null) return false;
        if (response != null) return true
    });
}

module.exports = checkUsername