const express = require('express');
let router = express.Router();
var escapeRegExp = require("../../modules/EscapeRegExp.js");
const { validate } = require('express-validation')

const CanobalUser = require("../../models/canobalUser.js");
const CalculatePermissions = require("../../modules/CalculatePermissions.js");

const userEditValidation = require("../../validation/canobalUser/edit.js");
const checkUsername = require("../../modules/CheckUsername.js")

var minio = require("../../modules/Minio.js");
const sharp = require('sharp');
var bodyParser = require('body-parser');

// Import Routes
const LoginRoute = require("./login.js");

// Use Routes
router.use("/login", LoginRoute)

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

router.route("/user/:userId").get((req, res) => {
    CanobalUser.findOne({ id: req.params.userId == "me" ? res.locals.id : req.params.userId }).then(async user => {
        if (user == null) return res.status(404).send()
        if (user.id != res.locals.id) {
            if (!(await CalculatePermissions(res.locals.id)).includes("READ_USER_AUTH")) {
                user.authType = undefined;
                user.auth = undefined;
                user.authVerified = undefined;
            }
        }
        user.loginCode = undefined;
        res.json(user);
    });
}).patch(validate(userEditValidation, {}, {}), async (req, res) => {
    if (!res.locals.id) return res.status(401).send();
    if (req.params.userId != "me" && !(await CalculatePermissions(res.locals.id)).includes("MODIFY_USER")) return res.status(403).send();
    if (req.body.username && await checkUsername(req.body.username) != false && await checkUsername(req.body.username) != (req.params.userId == "me" ? res.locals.id : req.params.userId)) return res.status(400).send("Username is taken.");

    CanobalUser.updateOne(
        {
            "id": req.params.userId == "me" ? res.locals.id : req.params.userId
        },
        {
            ...req.body
        }).then(res.send()).catch(err => res.send(err))
});


router.route("/user/:userId/pfp").get((req, res) => {
    CanobalUser.findOne({ "id": req.params.userId == "me" ? res.locals.id : req.params.userId }, "pfp").then(user => {
        if (user == null) return res.status(404).send()
        if (user.pfp == "default") {
            res.redirect("https://cdn.anolet.com/pfps/default.png")
        } else {
            res.redirect("https://cdn.anolet.com/pfps/" + (req.params.userId == "me" ? res.locals.id : req.params.userId) + "/pfp." + user.pfp)
        }
    });
}).put(bodyParser.raw({
    inflate: true,
    limit: '100mb',
    type: 'image/*'
}), async (req, res) => {
    if (!res.locals.id) return res.status(401).send("Unauthorized");
    if (req.body == {} || !req.body) return res.status(400).send("Invalid body");
    if (req.params.userId != "me" && !(await CalculatePermissions(res.locals.id)).includes("SET_USER_AVATAR")) return res.status(403).send();
    if (!req.headers['content-type'] || !(req.headers['content-type'].split("/")[1] == "png" || req.headers['content-type'].split("/")[1] == "jpg" || req.headers['content-type'].split("/")[1] == "jpeg" || req.headers['content-type'].split("/")[1] == "heif" || req.headers['content-type'].split("/")[1] == "avif" || req.headers['content-type'].split("/")[1] == "webp")) return res.status(400).send("Invalid format");
    
    // Resize their avatar
    let dat = await sharp(req.body).resize(400, 400).toBuffer()

    // Remove old avatar
    let _user = await CanobalUser.findOne({ "id": (req.params.userId == "me" ? res.locals.id : req.params.userId) }, "pfp")

    minio.removeObject('anolet', `pfps/${req.params.userId == "me" ? res.locals.id : req.params.userId}/pfp.` + _user.pfp, function (err, etag) {
        // New avatar
        minio.putObject('anolet', `pfps/${req.params.userId == "me" ? res.locals.id : req.params.userId}/pfp.` + req.headers['content-type'].split("/")[1], dat, function (err, etag) {
            if (err) return res.status(500).send();
            CanobalUser.updateOne(
                { id: req.params.userId == "me" ? res.locals.id : req.params.userId }, {
                pfp: req.headers['content-type'].split("/")[1],
            }).then(res.send("Avatar set"));
        })
    })
}).delete(async (req, res) => {
    if (!res.locals.id) return res.status(401).send("Unauthorized");
    if (req.params.userId != "me" && !(await CalculatePermissions(res.locals.id)).includes("SET_USER_AVATAR")) return res.status(403).send();
    CanobalUser.findOne({ "id": req.params.userId == "me" ? res.locals.id : req.params.userId }, "pfp").then(user => {
        if (user.pfp == "default") return res.status(404).send();
        minio.removeObject('anolet', `pfps/${req.params.userId == "me" ? res.locals.id : req.params.userId}/pfp.` + user.avatar, function (err, etag) {
            if (err) return res.status(500).send();
            CanobalUser.findOneAndUpdate(
                { id: req.params.userId == "me" ? res.locals.id : req.params.userId }, {
                pfp: "default",
            }).then(() => res.send());
        });
    });
});

module.exports = router
