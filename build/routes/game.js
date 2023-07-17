"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const game_1 = require("../models/game");
exports.router = express_1.default.Router();
exports.router.route("/s").get((req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    const query = {};
    let page = 0;
    if (req.query.page)
        page = parseInt(req.query.page.toString());
    game_1.Game.find(query, undefined, { skip: 20 * page, limit: 20, sort: { playing: "desc" } }, function (err, results) {
        res.json(results);
    });
});
exports.router.get("/:gameId/cacheableAssets", (req, res) => {
    game_1.Game.findOne({ "id": req.params }).then(game => {
        // Returns all assetURLs, add game privacy check soon
        res.json(game.zones.map(zone => zone.layers.map(layer => layer.assetURL)).flat());
    });
});
exports.router.route("/:gameId").get((req, res) => {
    game_1.Game.findOne({ "id": req.params.gameId }).then(game => {
        if (game == null)
            return res.status(404).send();
        delete game.gdp;
        if (parseInt(req.params.gameId) == 1 || req.headers.serverauth == process.env.HASH) {
            res.json(game);
        }
        else {
            game.zones = undefined;
            game.worldSettings = undefined;
            res.json(game);
        }
    });
});
