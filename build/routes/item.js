"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const sharp_1 = __importDefault(require("sharp"));
const trim_image_1 = __importDefault(require("trim-image"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const item_1 = require("../models/item");
const user_1 = require("../models/user");
const canobalUser_1 = require("../models/canobalUser");
const transaction_1 = require("../models/transaction");
const Minio_1 = require("../modules/Minio");
const body_parser_1 = __importDefault(require("body-parser"));
const express_validation_1 = require("express-validation");
const item_2 = __importDefault(require("../../validation/item"));
const itemEdit_1 = __importDefault(require("../../validation/itemEdit"));
const uuid_1 = require("uuid");
const CalculatePermissions_1 = require("../modules/CalculatePermissions");
exports.router = express_1.default.Router();
exports.router.route("/").post((0, express_validation_1.validate)(item_2.default, {}, {}), async (req, res) => {
    if (!res.locals.id)
        return res.status(401).send();
    if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_ANOLET") && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_SELF"))
        return res.status(403).send();
    const genId = (0, uuid_1.v4)();
    if (!res.locals.permissions.includes("UPLOAD_ANOLET") && req.body?.anoletAccount)
        return res.status(403).send("You can't publish to the Anolet account");
    if (!res.locals.permissions.includes("UPLOAD_SELF") && !req.body?.anoletAccount)
        return res.status(403).send("You can't publish as yourself");
    await new item_1.Item({
        name: req.body.name,
        description: req.body.description,
        owner: !req.body?.anoletAccount ? res.locals.id : "anolet",
        manager: res.locals.id,
        type: req.body.type,
        price: 0,
        sales: 0,
        saleEnd: '2001-01-01T05:00:00.000Z',
        salePrice: 0,
        assetUploaded: false,
        available: false,
        id: genId,
        created: new Date()
    }).save();
    res.send(genId);
});
exports.router.route("/s").get(async (req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    let query = { available: true };
    let search = "";
    if (req.headers["x-anolet-filter"])
        query = { type: req.headers["x-anolet-filter"][0], available: true };
    if (req.headers["x-anolet-filter"] == "my-creations")
        query = { manager: res.locals.id };
    if (req.headers["x-anolet-search"]) {
        search = req.headers["x-anolet-search"][0];
        query.$text = { $search: search };
    }
    const dbResponse = item_1.Item.find(query, search ? { score: { $meta: "textScore" } } : undefined);
    if (search) {
        //todo
        // @ts-ignore
        dbResponse.sort({ score: { $meta: "textScore" } }, { _id: -1 }).exec((err, docs) => { res.json(docs); });
    }
    else {
        dbResponse.sort({ _id: -1 }).exec((err, docs) => { res.json(docs); });
    }
});
exports.router.route("/:itemId/upload").post(body_parser_1.default.raw({
    inflate: true,
    limit: '100mb',
    type: 'image/png'
}), async (req, res) => {
    if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_ANOLET") && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_SELF"))
        return res.status(403).send();
    item_1.Item.findOne({ id: req.params.itemId }, "manager available").then(async (resp) => {
        if (req.body.isEmpty())
            return res.status(400).send("Invalid body");
        if (resp.manager != res.locals.id)
            return res.status(403).send("You don't manage this item.");
        if (resp.available == true)
            return res.status(400).send("You can't change an item's asset after it has been released.");
        (0, sharp_1.default)(req.body)
            .resize(1000, 1000)
            .toBuffer()
            .then(dat => {
            let fileName = path_1.default.join(__dirname, '../tmp') + "/" + req.params.itemId + ".png";
            let trimName = path_1.default.join(__dirname, '../tmp') + "/trim-" + req.params.itemId + ".png";
            // Generate Preview
            fs_1.default.writeFile(fileName, dat, function (err) {
                (0, trim_image_1.default)(fileName, trimName, undefined, function (err) {
                    console.log(err);
                    //todo: We have to wait a bit for the file to be written. For some reason the callback is called before file writing is complete, so this is a ducktape solution for now.
                    setTimeout(function () {
                        fs_1.default.readFile(trimName, function (err, data) {
                            Minio_1.minio.putObject('anolet', `items/${req.params.itemId}/preview.png`, data, function (err, etag) {
                                console.log(err);
                                fs_1.default.unlink(fileName, (err) => { if (err)
                                    throw err; });
                            });
                        });
                    }, 3000);
                });
            });
            Minio_1.minio.putObject('anolet', `items/${req.params.itemId}/internal.png`, dat, function (err, etag) {
                if (err)
                    return res.status(500).send();
                item_1.Item.findOneAndUpdate({ id: req.params.itemId }, {
                    assetUploaded: true,
                }).then(() => res.send("Item image set"));
            });
        });
    });
});
exports.router.route("/:itemId/purchase").post((req, res) => {
    item_1.Item.findOne({ "id": req.params.itemId }, "price saleEnd salePrice available owner").then(item => {
        if (item == null)
            return res.status(400).send("That item doesn't exist.");
        if (item.available == false)
            return res.status(400).send("Item is not available");
        let price = null;
        if (new Date(item.saleEnd) >= new Date()) {
            // item is on sale
            price = item.salePrice;
        }
        else
            price = item.price;
        user_1.User.findOne({ "id": res.locals.id }).then(usr => {
            canobalUser_1.CanobalUser.findOne({ "id": res.locals.id }).then(cbusr => {
                if (!(price > cbusr.gems) && !usr.belongings.includes(req.params.itemId)) {
                    // they can buy
                    user_1.User.updateOne({ id: item.owner }, { $inc: { gems: price } }).then(() => {
                        user_1.User.updateOne({ id: res.locals.id }, { $push: { belongings: req.params.itemId } }).then(() => {
                            canobalUser_1.CanobalUser.updateOne({ id: res.locals.id }, { $inc: { gems: -price } }).then(() => {
                                item_1.Item.updateOne({ id: req.params.itemId }, { $inc: { sales: 1 } }).then(() => {
                                    new transaction_1.Transaction({
                                        asset: req.params.itemId,
                                        assetType: "store",
                                        date: new Date(),
                                        gems: price,
                                        increaseParty: item.owner,
                                        decreaseParty: res.locals.id
                                    }).save();
                                    res.send("Purchase Successful");
                                });
                            });
                        });
                    });
                }
                else
                    return res.status(400).send("Insufficient balance or you already own this item.");
            });
        });
    });
});
exports.router.route("/:itemId").get((req, res) => {
    item_1.Item.findOne({ "id": req.params.itemId }).then(item => {
        if (item == null)
            return res.status(404).send();
        if (!item.available && item.manager != res.locals?.id)
            return res.status(400).send();
        res.json(item);
    });
}).patch((0, express_validation_1.validate)(itemEdit_1.default, {}, {}), async (req, res) => {
    if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_ANOLET") && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_SELF"))
        return res.status(403).send();
    item_1.Item.findOne({ id: req.params.itemId }, "available assetUploaded manager type created").then(resp => {
        if (!resp)
            res.status(404).send();
        if (resp.manager == res.locals.id) {
            if (resp.available && req.body.available == false)
                return res.status(400).send("You cannot change item type or availability after an item has been released");
            if (req.body.available == true && !resp.assetUploaded)
                return res.status(400).send("Item image must be uploaded before publishing.");
            if (!res.locals.permissions.includes("UPLOAD_ANOLET") && req.body?.anoletAccount == true)
                return res.status(403).send("You can't publish to the Anolet account");
            if (!res.locals.permissions.includes("UPLOAD_SELF") && req.body?.anoletAccount == false)
                return res.status(403).send("You can't publish as yourself");
            if (req.body.available)
                user_1.User.updateOne({ id: res.locals.id }, { $push: { belongings: req.params.itemId } }).then(() => { });
            item_1.Item.updateOne({ id: req.params.itemId }, {
                owner: req.body?.anoletAccount ? "anolet" : res.locals.id,
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                price: req.body.price,
                available: req.body.available,
                created: req.body.available ? new Date() : resp.created,
                saleEnd: req.body.saleEnd,
                salePrice: req.body.salePrice
            }).then(() => {
                res.send();
            });
        }
        else {
            res.status(400).send();
        }
    });
}).delete(async (req, res) => {
    if (!(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_ANOLET") && !(await (0, CalculatePermissions_1.CalculatePermissions)(res.locals.id)).includes("UPLOAD_SELF"))
        return res.status(403).send();
    item_1.Item.findOne({ id: req.params.itemId }, "available assetUploaded").then(resp => {
        if (!resp)
            res.status(404).send();
        if (resp.manager == res.locals.id && resp.available == false) {
            item_1.Item.deleteOne({ id: req.params.itemId }).then(resp => {
                res.send();
            });
            if (resp.assetUploaded) {
                Minio_1.minio.removeObjects('anolet', [`items/${req.params.itemId}/preview.png`, `items/${req.params.itemId}/internal.png`], () => { });
            }
        }
        else {
            res.status(400).send("You cannot delete an item after it has been released.");
        }
    });
});
