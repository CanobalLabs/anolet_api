const User = require("../models/user.js");

async function checkusername(username) {
    return User.findOne({ "username": username }).then(response => {
        if (response == null) return false;
        if (response != null) return true
    });
}

module.exports = checkusername