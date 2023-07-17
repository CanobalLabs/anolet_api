"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_validation_1 = require("express-validation");
const suspension_1 = __importDefault(require("../../../validation/user/suspension"));
const user_1 = require("../../models/user");
const GetUser_1 = require("../../modules/GetUser");
const Permission_1 = __importDefault(require("../../middleware/Permission"));
const uuid_1 = require("uuid");
const express_1 = __importDefault(require("express"));
const CalculatePermissions_1 = require("../../modules/CalculatePermissions");
exports.router = express_1.default.Router({ mergeParams: true });
exports.router.route("/").post((0, Permission_1.default)("USER_SUSPENSIONS"), (0, express_validation_1.validate)(suspension_1.default, {}, {}), async (req, res) => {
    // Check if user exists
    let user = await (0, GetUser_1.getUser)(req.params.userId, "anolet");
    if (!user)
        return res.status(404).send();
    if (req.params.userId == res.locals.id)
        return res.status(400).send("You cannot suspend yourself.");
    let suspensionUUID = (0, uuid_1.v4)();
    user_1.User.updateOne({
        "id": req.params.userId
    }, {
        $push: {
            suspensions: {
                id: suspensionUUID,
                suspensionStart: new Date(),
                suspendedBy: res.locals.id,
                ...req.body
            }
        }
    }).then(() => {
        res.send(suspensionUUID);
    }).catch(err => res.send(err));
});
exports.router.route("/:suspensionId").delete((0, Permission_1.default)("USER_SUSPENSIONS"), async (req, res) => {
    if (!res.locals.id)
        return req.status(401).send("Unauthorized");
    if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("USER_SUSPENSIONS")) {
        return res.status(403).send();
    }
    if (req.params.userId == res.locals.id)
        return res.status(400).send("You cannot unsuspend yourself.");
    // Check if suspension exists and user exists
    let user = await (0, GetUser_1.getUser)(req.params.userId, "anolet");
    if (!user)
        return res.status(404).send();
    let suspension = user.suspensions.find(suspension => suspension.id == req.params.suspensionId);
    if (!suspension)
        return res.status(404).send();
    // Check if they can delete this suspension
    if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("DELETE_OTHERS_SUSPENSIONS") && suspension.suspendedBy != res.locals.id)
        return res.status(403).send("You didn't create this suspension.");
    user_1.User.updateOne({
        "id": req.params.userId
    }, {
        $pull: {
            suspensions: {
                id: req.params.suspensionId
            }
        }
    }).then(() => {
        res.send();
    }).catch(err => res.send(err));
});
