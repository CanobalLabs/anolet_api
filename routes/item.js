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
        assetURL: "",
        previewURL: "",
        saleEnd: '1',
        salePrice: 0,
        available: false,
        id: genid,
        created: new Date()
    }).save();
    res.send(genid);
})

router.route("/s").get((req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    var query = {};
    var page = 0;
    if (req.headers["x-anolet-filter"]) query = { type: req.headers["x-anolet-filter"] }
    if (req.query.page) page = req.query.page
    Item.find(query, undefined/*, { skip: 20 * page, limit: 20 }*/, function (err, results) {
        res.json(results)
    });
});

router.route("/:itemId/upload").post(Permission("SHOP"), bodyParser.raw({
    inflate: true,
    limit: '100mb',
    type: 'image/png'
}), (req, res) => {
    Item.findOne({ id: req.params.itemId }).then(resp => {
        if (true) {
            if (req.body == {}) return res.status(400).send("Invalid body")
            minio.putObject('anolet', `items/${req.params.itemId}/internal.png`, req.body, function (err, etag) {
                if (err) return res.status(500).send();
                Item.findOneAndUpdate(
                    { id: req.params.itemId }, {
                    assetURL: `items/${req.params.itemId}/internal.png`,
                    previewURL: `` // Until RCCService is finished
                }).then(() => res.send("Item image set"));
            });
        } else {
            res.status(400).send();
        }
    });
});

router.route("/:itemId/purchase").post((req, res) => {
    Item.findOne({ "id": req.params.itemId }).then(item => {
        if (item == null) return res.status(400).send("That item doesn't exist.");
        var price;
        var plural;
         switch (item.type) {
      case "hat":
        plural = "hats"
        break;
      case "body":
        plural = "bodies"
        break;
      case "face":
        plural = "faces"
        break;
      case "shoes":
        plural = "shoes"
        break;
    }
        if (new Date(item.saleEnd) >= new Date()) {
            // item is on sale
            price == item.salePrice
        } else price == item.price;
        User.findOne({ "id": res.locals.id }).then(usr => {
            if (!(price > usr.amulets) && !usr.belongings[item.type].includes(item.id)) {
                // they can buy
                User.updateOne({ id: res.locals.id }, { $push: { "belongings.${itype}": item.id }, $inc: { "amulets": -item.price } }, { arrayFilters: [{ itype: plural }] });
                User.updateOne({ id: item.owner }, { $inc: { amulets: item.price } });
                res.send("Purchase Successful")
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
