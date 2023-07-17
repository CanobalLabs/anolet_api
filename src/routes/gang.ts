import {CalculatePermissions} from "../modules/CalculatePermissions";
import {v4 as uuidv4} from "uuid";
import {minio} from "../modules/Minio";
import {validate} from "express-validation";
import GangValidator from "../../validation/gang";
import {Gang} from "../models/gang";
import express from "express";

export let router = express.Router();
router.get("/s", (req, res) => {
    const query: {
        id?: string,
        realName?: string,
        displayName?: string
    } = {};
    let page = 0;
    if (req.query.id) query.id = req.query.id.toString();
    if (req.query.realName) query.realName = req.query.realName.toString();
    if (req.query.displayName) query.displayName = req.query.displayName.toString();
    if (req.query.page) page = parseInt(req.query.page.toString());
    Gang.find(query, undefined, { skip: 20 * page, limit: 20, sort: { playing: "desc" } }, function (err, results) {
        res.json(results)
    });
});

router.post("/", validate(new GangValidator("creation").getValidator()), async (req: any, res: any) => {
    Gang.find({ realName: req.body.realName }, undefined, {skip: 0, limit: 20}, function(err, results) {
       if (err) res.status(500).send;
       if (results.length > 0) res.status(401).body("A guild already exists with that realName").send();
    });

    let gang = new Gang({
        id: uuidv4(),
        created: new Date(),
        ... req.body
    });

    await gang.save();
    res.status(201).json(gang);
});