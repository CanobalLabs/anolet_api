"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Game = require("../models/game");
exports.router = express_1.default.Router();
exports.router.route("/:gameId/requestGameLaunchAuthorization").post((req, res) => {
    Game.findOne({ "id": req.params.gameId }).then(game => {
        if (game == null)
            return res.status(404).send();
        // for partial legacy compatibility
        if (game.privacyLevel == 0 || game.privacyLevel == -1) {
            // Any user can access, authorize.
            res.send(jsonwebtoken_1.default.sign({ game: req.params.gameId, user: res.locals.id }, process.env.HASH, { expiresIn: "30s" }));
        }
        else if (game.privacyLevel == 1) {
            // Only the creator can access, check
            console.log(res.locals.id, game.creator.id);
            if (res.locals.id == game.creator.id) {
                res.send(jsonwebtoken_1.default.sign({ game: req.params.gameId, user: res.locals.id }, process.env.HASH, { expiresIn: "30s" }));
            }
            else {
                res.status(403).send("You do not own that game.");
            }
        }
    });
});
exports.router.route("/:gameId/increaseVisitCount").patch((req, res) => {
    if (req.headers.serverauth == process.env.HASH) {
        Game.findOne({ "id": req.params.gameId }).then(game => {
            if (game == null)
                return res.status(404).send();
            Game.updateOne({ id: req.params.gameId }, { $inc: { visits: 1 } }).then(() => {
                res.send();
            });
        });
    }
    else
        res.status(403).send("You do not have permission to do that.");
});
exports.router.route("/:gameId/setPlayerCount/:count").patch((req, res) => {
    if (req.headers.serverauth == process.env.HASH) {
        Game.findOne({ "id": req.params.gameId }).then(game => {
            if (game == null)
                return res.status(404).send();
            // @ts-ignore
            if (req.params.gameId == 1) {
                Game.updateOne({ id: req.params.gameId }, { $set: { playingP: req.params.count } }).then(() => {
                    res.send();
                });
            }
            else {
                Game.updateOne({ id: req.params.gameId }, { $set: { playing: req.params.count } }).then(() => {
                    res.send();
                });
            }
        });
    }
    else
        res.status(403).send("You do not have permission to do that.");
});
