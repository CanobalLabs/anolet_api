const express = require('express');
let router = express.Router();

const User = require("../../models/user.js");
const GetUser = require("../../modules/GetUser.js");
const CalculatePermissions = require("../../modules/CalculatePermissions.js");

// Import Routes
const SuspensionRoute = require("./suspension.js");
const AvatarRoute = require("./avatar.js");

// Use Routes
router.use("/:userId/suspension", SuspensionRoute)
router.use("/:userId/avatar", AvatarRoute)

router.route("/s").get(async (req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    var query = {};
    var search = "";
    var page = 0;
    if (req.query.page) page = req.query.page

    if (req.headers["x-anolet-search"]) { search = req.headers["x-anolet-search"]; query.$text = { $search: search }; }
    var dbresp = User.find(query, search ? { score: { $meta: "textScore" }, skip: 20 * page, limit: 20 } : undefined);

    if (search) {
        dbresp.sort({ score: { $meta: "textScore" } }, { _id: -1 }).exec((err, docs) => { res.json(docs) });
    } else {
        dbresp.sort({ _id: -1 }).exec((err, docs) => { res.json(docs) });
    }

});

router.route("/:userId").get(async (req, res) => {
    console.log(res.locals.id)
    let user = await GetUser(req.params.userId == "me" ? res.locals.id : req.params.userId, "both")
    if (!user) return res.status(404).send()
    if (!(req.params.userId == "me" || req.params.userId == res.locals.id)) {
        console.log(res.locals.id)
        if (!(await CalculatePermissions(res.locals.id)).includes("USER_SUSPENSIONS")) {
            user.suspensions = undefined;
        }
        if (!(await CalculatePermissions(res.locals.id)).includes("READ_USER_AUTH")) {
            user.authType = undefined;
            user.auth = undefined;
            user.authVerified = undefined;
        }
    } else {
        user.suspensions.forEach(suspension => {
            suspension.suspendedBy = undefined;
            suspension.internalNote = undefined;
        })
    }
    user.loginCode = undefined;
    res.json(user)
});

router.route("/:userId/permissions").get(async (req, res) => {
    let user = GetUser(req.params.userId, "anolet");
    if (!user) return res.status(404).send();
    res.json(await CalculatePermissions(user.ranks));
});

module.exports = router
