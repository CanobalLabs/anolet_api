"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const Cryptr_1 = require("./Cryptr");
function checkAuth(req, res, next) {
    if (!req.headers.authorization) {
        res.locals.id = 0;
    }
    else {
        try {
            var section = Cryptr_1.Cryptr.decrypt(req.headers.authorization.split("~")[1]);
            console.log(section);
            var id = section.split("~")[0];
            var vendor = section.split("~")[1];
            if (id) {
                res.locals.id = id;
                res.locals.vendor = vendor;
            }
        }
        catch (e) {
            res.locals.id = 0;
            res.locals.vendor = null;
        }
    }
    next();
}
exports.checkAuth = checkAuth;
