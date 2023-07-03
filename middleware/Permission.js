const CalculatePermissions = require("../modules/CalculatePermissions.js");
const User = require("../models/user.js");
module.exports = function (perm1, perm2) {
    return async function (req, res, next) {
        if (!res.locals.id) return res.status(401).send();
        if ((await CalculatePermissions(res.locals.id)).includes(perm1) || (await CalculatePermissions(res.locals.id)).includes(perm2)) {
            res.locals.permissions = await CalculatePermissions(res.locals.id)
            next()
        } else {
            res.status(403).send()
        }
    }
}
