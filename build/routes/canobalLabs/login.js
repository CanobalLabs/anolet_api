"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const canobalUser_1 = require("../../models/canobalUser");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const GenerateToken_1 = require("../../modules/GenerateToken");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const vendors = require("../../../constants/vendors.json");
const twilio_1 = __importDefault(require("twilio"));
exports.router = express_1.default.Router();
mail_1.default.setApiKey(process.env.MAIL);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
// TBD: Ratelimit 30 seconds via express-rate-limit w/ rate-limit-redis
exports.router.post("/sendLoginCode", async (req, res) => {
    if (!req.body.auth || !req.body.vendor)
        return res.status(400).send();
    canobalUser_1.CanobalUser.findOne({ auth: req.body.auth }).then(async (response) => {
        // Check if vendor exists
        if (vendors[req.body.vendor] == undefined)
            return res.status(400).send();
        if (response == null)
            response = await canobalUser_1.CanobalUser.create({ id: (0, uuid_1.v4)(), created: new Date(), authType: "email", "auth": req.body.auth, registeredVendors: [req.body.vendor], lastLogin: null, loginCode: null, loginVendor: null });
        // generate random 6 digit number
        let loginCode = Math.floor(100000 + Math.random() * 900000);
        await canobalUser_1.CanobalUser.updateOne({ auth: req.body.auth }, { loginCode: loginCode, loginVendor: req.body.vendor });
        if (response.authType == "phone") {
            // Not possible until release
            // https://support.twilio.com/hc/en-us/articles/11847054539547-A2P-10DLC-Campaign-Approval-Best-Practices
        }
        else if (response.authType == "email") {
            mail_1.default.send({
                to: req.body.auth,
                from: {
                    email: 'noreply+canoballabs@anolet.com',
                    name: vendors[req.body.vendor].name
                },
                subject: `${loginCode} is your code for ${vendors[req.body.vendor].name} login`,
                text: 'Login to ${req.body.vendor} with your Canobal Labs account using ' + loginCode + '.',
                html: fs_1.default.readFileSync('./notifications/login/email.html', 'utf8').replaceAll("${code}", String(loginCode)).replaceAll("${vendor.name}", vendors[req.body.vendor].name).replaceAll("${vendor.logo}", vendors[req.body.vendor].logo)
            }).then(() => { res.send("Email sent"); }).catch((error) => { res.send(error); });
        }
    });
});
exports.router.post("/:code", async (req, res) => {
    if (!req.params.code || !req.body.auth || !req.body.vendor)
        return res.status(400).send();
    if (req.params.code.length != 6 || isNaN(parseFloat(req.params.code)))
        return res.status(400).send();
    canobalUser_1.CanobalUser.findOne({ auth: req.body.auth, loginCode: req.params.code, loginVendor: req.body.vendor }).then(async (response) => {
        if (response == null)
            return res.status(400).json({
                token: null,
                error: "An account with that auth and login code does not exist."
            });
        res.json({ token: (0, GenerateToken_1.GenerateToken)(response.id, req.body.vendor), error: false });
        if (response.registeredVendors.includes(req.body.vendor)) {
            await canobalUser_1.CanobalUser.updateOne({ auth: req.body.auth }, { loginCode: null, loginVendor: null, lastLogin: new Date() });
        }
        else {
            await canobalUser_1.CanobalUser.updateOne({ auth: req.body.auth }, { $set: { loginCode: null, loginVendor: null, lastLogin: new Date() }, $push: { registeredVendors: req.body.vendor } });
        }
    });
});
