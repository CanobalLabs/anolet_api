import express from "express";
import {Game} from "../models/game";

export let router = express.Router();
router.route("/s").get((req, res) => {
    // remember for frontend devs, pages start at 0 on the backend
    const query = {};
    let page = 0;
    if (req.query.page) page = parseInt(req.query.page.toString());
    Game.find(query, undefined, { skip: 20 * page, limit: 20, sort: { playing: "desc" } }, function (err, results) {
        res.json(results)
    });
});

router.get("/:gameId/cacheableAssets", (req: any, res: any) => {
    Game.findOne({ "id": req.params }).then(game => {
        // Returns all assetURLs, add game privacy check soon
        res.json(game.zones.map(zone => zone.layers.map(layer => layer.assetURL)).flat());
    });
});

router.route("/:gameId").get((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        if (game == null) return res.status(404).send()
        delete game.gdp;
        if (parseInt(req.params.gameId) == 1 || req.headers.serverauth == process.env.HASH) {
            res.json(game);
        } else {
            game.zones = undefined;
            game.worldSettings = undefined;
            res.json(game);
        }
    });
});
