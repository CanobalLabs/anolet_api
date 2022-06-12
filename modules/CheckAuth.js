const cryptr = require ("./Cryptr.js")
function checkauth(req, res, next) {
    if (!req.headers.authorization) {
        res.locals.id = 0;
    } else {
        try {
            var id = cryptr.decrypt(req.headers.authorization.split("-")[1]);
            if (id) {
                res.locals.id = id;
            }
        } catch (e) {
            res.locals.id = 0;
        }
    }
    next();
}
module.exports = checkauth