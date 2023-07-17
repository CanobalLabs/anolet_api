"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const canobalUser_1 = require("../../models/canobalUser");
const CalculatePermissions_1 = require("../../modules/CalculatePermissions");
const express_1 = __importDefault(require("express"));
const express_validation_1 = require("express-validation");
const edit_1 = __importDefault(require("../../../validation/canobalUser/edit"));
const CheckUsername_1 = require("../../modules/CheckUsername");
const Minio_1 = require("../../modules/Minio");
const sharp_1 = __importDefault(require("sharp"));
const body_parser_1 = __importDefault(require("body-parser"));
// Import Routes
const login_1 = require("./login");
exports.router = express_1.default.Router();
// Use Routes
exports.router.use("/login", login_1.router);
/*router.route("/search").get(async (req, res) => {
    // pages start at 0 on the backend
    var page = 0;
    if (req.query.page) page = req.query.page
    if (!req.query.search) return res.status(400).send()
    let search = await CanobalUser.find({ username: new RegExp(escapeRegExp(req.query.search), 'i') }, { skip: 20*page, limit: 20 })
    search.forEach(async user => {
        if (id == res.locals.id) {
            if (!(await CalculatePermissions(res.locals.id)).includes("READ_USER_AUTH")) {
                user.authType = undefined;
                user.auth = undefined;
                user.authVerified = undefined;
            }
        }
        user.loginCode = undefined;
    });
}); */ // fix later
exports.router.route("/user/:userId").get((req, res) => {
    canobalUser_1.CanobalUser.findOne({ id: req.params.userId == "me" ? res.locals.id : req.params.userId }).then(async (user) => {
        if (user == null)
            return res.status(404).send();
        if (user.id != res.locals.id) {
            if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("READ_USER_AUTH")) {
                user.authType = undefined;
                user.auth = undefined;
                user.authVerified = undefined;
            }
        }
        user.loginCode = undefined;
        res.json(user);
    });
}).patch((0, express_validation_1.validate)(edit_1.default, {}, {}), async (req, res) => {
    if (!res.locals.id)
        return res.status(401).send();
    if (req.params.userId != "me" && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("MODIFY_USER"))
        return res.status(403).send();
    if (req.body.username && await (0, CheckUsername_1.checkUsername)(req.body.username) != false && await (0, CheckUsername_1.checkUsername)(req.body.username) != (req.params.userId == "me" ? res.locals.id : req.params.userId))
        return res.status(400).send("Username is taken.");
    canobalUser_1.CanobalUser.updateOne({
        "id": req.params.userId == "me" ? res.locals.id : req.params.userId
    }, {
        ...req.body
    }).then(res.send()).catch(err => res.send(err));
});
exports.router.route("/user/:userId/pfp").get((req, res) => {
    canobalUser_1.CanobalUser.findOne({ "id": req.params.userId == "me" ? res.locals.id : req.params.userId }, "pfp").then(user => {
        if (user == null)
            return res.status(404).send();
        if (user.pfp == "default") {
            res.redirect("https://cdn.anolet.com/pfps/default.png");
        }
        else {
            res.redirect("https://cdn.anolet.com/pfps/" + (req.params.userId == "me" ? res.locals.id : req.params.userId) + "/pfp." + user.pfp);
        }
    });
}).put(body_parser_1.default.raw({
    inflate: true,
    limit: '100mb',
    type: 'image/*'
}), async (req, res) => {
    if (!res.locals.id)
        return res.status(401).send("Unauthorized");
    if (req.body.isEmpty() || !req.body)
        return res.status(400).send("Invalid body");
    if (req.params.userId != "me" && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("SET_USER_AVATAR"))
        return res.status(403).send();
    if (!req.headers['content-type'] || !(req.headers['content-type'].split("/")[1] == "png" || req.headers['content-type'].split("/")[1] == "jpg" || req.headers['content-type'].split("/")[1] == "jpeg" || req.headers['content-type'].split("/")[1] == "heif" || req.headers['content-type'].split("/")[1] == "avif" || req.headers['content-type'].split("/")[1] == "webp"))
        return res.status(400).send("Invalid format");
    // Resize their avatar
    let dat = await (0, sharp_1.default)(req.body).resize(400, 400).toBuffer();
    // Remove old avatar
    let _user = await canobalUser_1.CanobalUser.findOne({ "id": (req.params.userId == "me" ? res.locals.id : req.params.userId) }, "pfp");
    Minio_1.minio.removeObject('anolet', `pfps/${req.params.userId == "me" ? res.locals.id : req.params.userId}/pfp.` + _user.pfp, function (err, etag) {
        // New avatar
        Minio_1.minio.putObject('anolet', `pfps/${req.params.userId == "me" ? res.locals.id : req.params.userId}/pfp.` + req.headers['content-type'].split("/")[1], dat, function (err, etag) {
            if (err)
                return res.status(500).send();
            canobalUser_1.CanobalUser.updateOne({ id: req.params.userId == "me" ? res.locals.id : req.params.userId }, {
                pfp: req.headers['content-type'].split("/")[1],
            }).then(res.send("Avatar sent."));
        });
    });
}).delete(async (req, res) => {
    if (!res.locals.id)
        return res.status(401).send("Unauthorized");
    if (req.params.userId != "me" && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("SET_USER_AVATAR"))
        return res.status(403).send();
    canobalUser_1.CanobalUser.findOne({ "id": req.params.userId == "me" ? res.locals.id : req.params.userId }, "pfp").then((user) => {
        if (user.pfp == "default")
            return res.status(404).send();
        Minio_1.minio.removeObject('anolet', `pfps/${req.params.userId == "me" ? res.locals.id : req.params.userId}/pfp.` + user.avatar, function (err, etag) {
            if (err)
                return res.status(500).send();
            canobalUser_1.CanobalUser.findOneAndUpdate({ id: req.params.userId == "me" ? res.locals.id : req.params.userId }, {
                pfp: "default",
            }).then(() => res.send());
        });
    });
});
