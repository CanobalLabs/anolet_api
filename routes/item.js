const express = require('express');
let router = express.Router();
const Item = require("../models/item.js");
const User = require("../models/user.js");
const Permission = require("../middleware/Permission.js");
var minio = require("../modules/Minio.js");
var bodyParser = require('body-parser');
const { validate } = require('express-validation')
const validation = require("../validation/item.js");
const validationEdit = require("../validation/itemEdit.js");
const { v4: uuidv4 } = require('uuid');

router.route("/").post(Permission("UPLOAD_SELF", "UPLOAD_ANOLET"), validate(validation, {}, {}), (req, res) => {
    var genid = uuidv4()
    if (!res.locals.permissions.includes("UPLOAD_ANOLET") && req.body?.anoletAccount) return res.status(403).send("You can't publish to the Anolet account");
    if (!res.locals.permissions.includes("UPLOAD_SELF") && !req.body?.anoletAccount) return res.status(403).send("You can't publish as yourself");
    new Item({
        name: req.body.name,
        description: req.body.description,
        owner: req.body?.anoletAccount ? "anolet" : res.locals.id,
        manager: res.locals.id,
        type: req.body.type,
        price: 0,
        sales: 0,
        saleEnd: '2001-01-01T05:00:00.000Z',
        salePrice: 0,
        assetUploaded: false,
        available: false,
        id: genid,
        created: new Date()
    }).save();
    res.send(genid);
})

router.route("/s").get(async (req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    var query = { available: true };
    var search = "";
    if (req.headers["x-anolet-filter"]) query = { type: req.headers["x-anolet-filter"], available: true }
    if (req.headers["x-anolet-filter"] == "my-creations") query = { manager: res.locals.id }
    if (req.headers["x-anolet-search"]) { search = req.headers["x-anolet-search"]; query.$text = { $search: search }; }
    var dbresp = Item.find(query, search ? { score: { $meta: "textScore" } } : undefined);

    if (search) {
        dbresp.sort({ score: { $meta: "textScore" } }).exec((err, docs) => { res.json(docs) });
    } else {
        dbresp.exec((err, docs) => { res.json(docs) });
    }

});

const sharp = require('sharp');
const trimImage = require("trim-image");
var fs = require('fs');
const path = require('path');

router.route("/:itemId/upload").post(Permission("UPLOAD_SELF", "UPLOAD_ANOLET"), bodyParser.raw({
    inflate: true,
    limit: '100mb',
    type: 'image/png'
}), (req, res) => {
    Item.findOne({ id: req.params.itemId }, "manager available").then(async resp => {
        if (req.body == {}) return res.status(400).send("Invalid body");
        if (resp.manager != res.locals.id) return res.status(403).send("You don't manage this item.");
        if (resp.available == true) return res.status(400).send("You can't change an item's asset after it has been released.");
        sharp(req.body)
            .resize(1000, 1000)
            .toBuffer()
            .then(dat => {
                let fileName = path.join(__dirname, '../tmp') + "/" + req.params.itemId + ".png";
                let trimName = path.join(__dirname, '../tmp') + "/trim-" + req.params.itemId + ".png"

                // Generate Preview
                fs.writeFile(fileName, dat, function (err) {
                    trimImage(fileName, trimName, undefined, function (err) {
                        console.log(err);
                        // We have to wait a bit for the file to be written. For some reason the callback is called before file writing is complete, so this is a ducktape solution for now.
                        setTimeout(function () {
                            fs.readFile(trimName, function (err, data) {
                                minio.putObject('anolet', `items/${req.params.itemId}/preview.png`, data, function (err, etag) {
                                    console.log(err);
                                    fs.unlink(fileName, (err) => { if (err) throw err });
                                });
                            });
                        }, 3000);
                    });
                });

                minio.putObject('anolet', `items/${req.params.itemId}/internal.png`, dat, function (err, etag) {
                    if (err) return res.status(500).send();
                    Item.findOneAndUpdate(
                        { id: req.params.itemId }, {
                        assetUploaded: true,
                    }).then(() => res.send("Item image set"));
                });
            });
    });
});

router.route("/:itemId/purchase").post((req, res) => {
    Item.findOne({ "id": req.params.itemId }).then(item => {
        if (item == null) return res.status(400).send("That item doesn't exist.");
        var price = null;
        if (new Date(item.saleEnd) >= new Date()) {
            // item is on sale
            price = item.salePrice
        } else price = item.price;
        User.findOne({ "id": res.locals.id }).then(usr => {
            if (!(price > usr.amulets) && !usr.belongings.includes(item.id)) {
                // they can buy
                User.updateOne({ id: item.owner }, { $inc: { amulets: price } }).then(() => {
                    User.updateOne({ id: res.locals.id }, { $push: { belongings: item.id }, $inc: { amulets: -price } }).then(() => {
                        Item.updateOne({ id: item.id }, { $inc: { sales: 1 } }).then(() => {
                            res.send("Purchase Successful")
                        });
                    });
                });
            } else return res.status(400).send("Insufficient balance or you already own this item.")
        });
    });
})

router.route("/:itemId").get((req, res) => {
    Item.findOne({ "id": req.params.itemId }).then(item => {
        if (item == null) return res.status(404).send();
        res.json(item);
    });
}).patch(Permission("UPLOAD_SELF", "UPLOAD_ANOLET"), validate(validationEdit, {}, {}), (req, res) => {
    Item.findOne({ id: req.params.itemId }, "available assetUploaded").then(resp => {
        if (!resp) res.status(404).send()
        if (resp.manager == res.locals.id) {
            if (resp.available && (req.body.type || req.body.available)) return res.status(400).send("You cannot change item type or availability after an item has been released");
            if (req.body.available == true && !resp.assetUploaded) return res.status(400).send("Item image must be uploaded before publishing.");
            if (!res.locals.permissions.includes("UPLOAD_ANOLET") && req.body?.anoletAccount) return res.status(403).send("You can't publish to the Anolet account");
            if (!res.locals.permissions.includes("UPLOAD_SELF") && !req.body?.anoletAccount) return res.status(403).send("You can't publish as yourself");

            Item.updateOne({ id: req.params.itemId }, {
                owner: req.body?.anoletAccount ? "anolet" : res.locals.id,
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                price: req.body.price,
                available: req.body.available,
                saleEnd: req.body.saleEnd,
                salePrice: req.body.salePrice
            }).then(resp => {
                res.send()
            });
        } else {
            res.status(400).send()
        }
    });
}).delete(Permission("UPLOAD_SELF", "UPLOAD_ANOLET"), (req, res) => {
    Item.findOne({ id: req.params.itemId }, "available assetUploaded").then(resp => {
        if (!resp) res.status(404).send()
        if (resp.manager == res.locals.id && resp.available == false) {
            Item.deleteOne({ id: req.params.itemId }).then(resp => {
                res.send()
            });
            if (item.assetUploaded) {
                minio.removeObjects('anolet', [`items/${req.params.itemId}/preview.png`, `items/${req.params.itemId}/internal.png`], () => {});
            }
        } else {
            res.status(400).send("You cannot delete an item after it has been released.")
        }
    });
});

module.exports = router
