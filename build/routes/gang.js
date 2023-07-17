"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const uuid_1 = require("uuid");
const express_validation_1 = require("express-validation");
const gang_1 = __importDefault(require("../../validation/gang"));
const gang_2 = require("../models/gang");
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
exports.router.get("/s", (req, res) => {
    const query = {};
    let page = 0;
    if (req.query.id)
        query.id = req.query.id.toString();
    if (req.query.realName)
        query.realName = req.query.realName.toString();
    if (req.query.displayName)
        query.displayName = req.query.displayName.toString();
    if (req.query.page)
        page = parseInt(req.query.page.toString());
    gang_2.Gang.find(query, undefined, { skip: 20 * page, limit: 20, sort: { playing: "desc" } }, function (err, results) {
        res.json(results);
    });
});
exports.router.post("/", (0, express_validation_1.validate)(new gang_1.default("creation").getValidator()), async (req, res) => {
    gang_2.Gang.find({ realName: req.body.realName }, undefined, { skip: 0, limit: 20 }, function (err, results) {
        if (err)
            res.status(500).send;
        if (results.length > 0)
            res.status(401).body("A guild already exists with that realName").send();
    });
    let gang = new gang_2.Gang({
        id: (0, uuid_1.v4)(),
        created: new Date(),
        ...req.body
    });
    await gang.save();
    res.status(201).json(gang);
});
