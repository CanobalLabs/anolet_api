"use strict";
const CalculatePermissions_1 = require("../modules/CalculatePermissions");
module.exports = function Permission(perm1, perm2) {
    return async function (req, res, next) {
        if (!res.locals.id)
            return res.status(401).send();
        if ((await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes(perm1) || (await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes(perm2)) {
            res.locals.permissions = await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id);
            next();
        }
        else {
            res.status(403).send();
        }
    };
};
