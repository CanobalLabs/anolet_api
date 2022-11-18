const CalculatePermissions = require("../modules/CalculatePermissions.js");
const User = require("../models/user.js");
module.exports = function (perm1, perm2) {
    return function (req, res, next) {
        if (!res.locals.id) return res.status(401).send();
        User.findOne({ "id": res.locals.id }).then(user => {
            if (CalculatePermissions(user.ranks).includes(perm1) || CalculatePermissions(user.ranks).includes(perm2)) {
                next()
            } else {
                res.status(403).send()
            }
        });
    }
  }
