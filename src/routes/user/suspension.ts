import {validate} from "express-validation";
import suspensionValidation from "../../../validation/user/suspension";
import {User} from "../../models/user";
import {getUser} from "../../modules/GetUser";
import Permission from "../../middleware/Permission";
import {v4 as uuidv4} from "uuid";
import express from "express";
import {CalculatePermissions} from "../../modules/CalculatePermissions";

export let router = express.Router({ mergeParams: true });

router.route("/").post(Permission("USER_SUSPENSIONS"), validate(suspensionValidation, {}, {}), async (req: any, res) => {
    // Check if user exists
    let user = await getUser(req.params.userId, "anolet")
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

router.route("/:suspensionId").delete(Permission("USER_SUSPENSIONS"), async (req: any, res) => {
    if (!res.locals.id) return req.status(401).send("Unauthorized");
    if (!(await CalculatePermissions(res.locals.id)).includes("USER_SUSPENSIONS")) {
        return res.status(403).send()
    }
    if (req.params.userId == res.locals.id) return res.status(400).send("You cannot unsuspend yourself.");

    // Check if suspension exists and user exists
    let user = await getUser(req.params.userId, "anolet")
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
