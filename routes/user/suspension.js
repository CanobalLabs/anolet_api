const express = require('express');
let router = express.Router({ mergeParams: true });

const User = require("../../models/user.js");
const { validate } = require('express-validation')
const suspensionValidation = require("../../validation/user/suspension.js");
const GetUser = require("../../modules/GetUser.js");
const Permission = require("../../middleware/Permission.js");
const { v4: uuidv4 } = require("uuid");

router.route("/").post(Permission("USER_SUSPENSIONS"), validate(suspensionValidation, {}, {}), async (req, res) => {
    // Check if user exists
    let user = await GetUser(req.params.userId, "anolet")
    if (!user) return res.status(404).send();

    if (req.params.userId == res.locals.id) return res.status(400).send("You cannot suspend yourself.");
    let suspensionUUID = uuidv4()
    User.updateOne(
        {
            "id": req.params.userId
        },
        {
            $push: {
                suspensions: {
                    id: suspensionUUID,
                    suspensionStart: new Date(),
                    suspendedBy: res.locals.id,
                    ... req.body
                }
            }
        }
    ).then(() => {
        res.send(suspensionUUID)
    }).catch(err => res.send(err))
})

router.route("/:suspensionId").delete(Permission("USER_SUSPENSIONS"), async (req, res) => {
    if (!res.locals.id) return req.status(401).send("Unauthorized");
    if (!(await CalculatePermissions(res.locals.id)).includes("USER_SUSPENSIONS")) {
        return res.status(403).send()
    }
    if (req.params.userId == res.locals.id) return res.status(400).send("You cannot unsuspend yourself.");

    // Check if suspension exists and user exists
    let user = await GetUser(req.params.userId, "anolet")
    if (!user) return res.status(404).send();
    let suspension = user.suspensions.find(suspension => suspension.id == req.params.suspensionId);
    if (!suspension) return res.status(404).send();

    // Check if they can delete this suspension
    if (!(await CalculatePermissions(res.locals.id)).includes("DELETE_OTHERS_SUSPENSIONS") && suspension.suspendedBy != res.locals.id) return res.status(403).send("You didn't create this suspension.")
    
    User.updateOne(
        {
            "id": req.params.userId
        },
        {
            $pull: {
                suspensions: {
                    id: req.params.suspensionId
                }
            }
        }
    ).then(() => {
        res.send()
    }).catch(err => res.send(err))
});

module.exports = router
