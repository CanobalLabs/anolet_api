import {User} from "../../models/user";

import {getUser} from "../../modules/GetUser";

import {CalculatePermissions} from "../../modules/CalculatePermissions";

import express from "express";


// Import Routes
import {router as SuspensionRoute} from "./suspension";
import {router as AvatarRoute} from "./avatar";

export let router = express.Router();
// Use Routes
router.use("/:userId/suspension", SuspensionRoute);
router.use("/:userId/avatar", AvatarRoute);

router.route("/s").get(async (req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    let query = {text: undefined};
    let search = "";
    let page = 0;
    if (req.query.page) page = parseInt(req.query.page.toString());

    if (req.headers["x-anolet-search"]) { search = req.headers["x-anolet-search"][0]; query.text = { $search: search }; }
    const dbresp = User.find(query, search ? {score: {$meta: "textScore"}, skip: 20 * page, limit: 20} : undefined);

    if (search) {
        // todo
        // @ts-ignore
        dbresp.sort({ score: { $meta: "textScore" } }, { _id: -1 }).exec((err, docs) => { res.json(docs) });
    } else {
        dbresp.sort({ _id: -1 }).exec((err, docs) => { res.json(docs) });
    }

});

router.route("/:userId").get(async (req, res) => {
    console.log(res.locals.id)
    if (req.params.userId.startsWith("player_")) {
        res.json({
            "id": req.params.userId,
            "__v": 0,
            "avatar": {
                "accessories": [
                    "a05b72b1-15b2-4d4a-b45e-1d1a9488bd4d"
                ],
                "bodies": [
                    "3d62ac6b-b48f-43ac-a8bf-f43040e75111"
                ],
                "faces": [
                    "0aff884e-112b-45dd-afd3-afa1ff3ec3c2"
                ],
                "shoes": [],
                "_id": "64b0bf7698f8725dbd667850"
            },
            "belongings": [
                "a05b72b1-15b2-4d4a-b45e-1d1a9488bd4d",
                "3d62ac6b-b48f-43ac-a8bf-f43040e75111",
                "0aff884e-112b-45dd-afd3-afa1ff3ec3c2",
            ],
            "defaultRender": false,
            "username": "Player " + req.params.userId.split("_")[1],
        });
    }
    let user = await getUser(req.params.userId == "me" ? res.locals.id : req.params.userId, "both")
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
    let user: any = getUser(req.params.userId, "anolet");
    if (!user) return res.status(404).send();
    res.json(await CalculatePermissions(user.ranks));
});
