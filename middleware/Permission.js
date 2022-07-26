const CalculatePermissions = require("../modules/CalculatePermissions.js");
const User = require("../models/user.js");
module.exports = function (permission) {
    return function (req, res, next) {
        if (!res.locals.id) return res.status(401).send();
        User.findOne({ "id": res.locals.id }).then(user => {
            if (CalculatePermissions(user.ranks).includes(permission)) {
                next()
            } else {
                res.status(403).send()
            }
        });
    }
  }