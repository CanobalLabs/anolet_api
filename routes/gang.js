const express = require('express');
let router = express.Router();
const Gang = require("../models/gang.js");
const GangValidator = require("../validation/gang.js");
const { validate } = require("express-validation");
const minio = require("../modules/Minio.js");
const { v4: uuidv4 } = require('uuid');
const CalculatePermissions = require("../modules/CalculatePermissions.js");

router.get("/s", (req, res) => {
    const query = {};
    let page = 0;
    if (req.query.id) query.id = req.query.id;
    if (req.query.realName) query.realName = req.query.realName;
    if (req.query.displayName) query.displayName = req.query.displayName;
    if (req.query.page) page = req.query.page
    Gang.find(query, undefined, { skip: 20 * page, limit: 20, sort: { playing: "desc" } }, function (err, results) {
        res.json(results)
    });
});

router.post("/", validate(new GangValidator("creation").getValidator()), async (req, res) => {
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

module.exports = router;