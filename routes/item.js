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

router.route("/").post(Permission("SHOP"), validate(validation, {}, {}), (req, res) => {
    var genid = uuidv4()
    new Item({
        name: req.body.name,
        description: req.body.description,
        owner: req.body.anoletAccount ? "anolet" : req.body.id,
        manager: req.body.id,
        type: req.body.type,
        price: req.body.price,
        saleEnd: '1',
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

router.route("/:itemId/upload").post(Permission("SHOP"), bodyParser.raw({
    inflate: true,
    limit: '100mb',
    type: 'image/png'
}), (req, res) => {
    Item.findOne({ id: req.params.itemId }).then(async resp => {
        if (req.body == {}) return res.status(400).send("Invalid body")
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
        if (item == null) return res.status(404).send()
        res.json(item);
    });
}).patch(Permission("SHOP"), validate(validationEdit, {}, {}), (req, res) => {
    Item.findOne({ id: req.params.itemId }).then(resp => {
        if (resp && resp.manager == req.body.id) {
            Item.findOneAndUpdate({ id: req.params.itemId }, {
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                price: req.body.price,
                available: req.body.available,
                saleEnd: req.body.saleEnd,
                salePrice: req.body.salePrice
            }, { new: true }).then(resp => {
                res.send()
            });
        } else {
            res.status(400).send()
        }
    });
});

module.exports = router
