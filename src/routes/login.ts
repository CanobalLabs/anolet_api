const express = require('express');
let router = express.Router();
const CanobalUser = require("../models/canobalUser.ts");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const CheckUsername = require("../modules/CheckUsername.ts");
const { validate } = require('express-validation');
const fs = require('fs');
const GenerateToken = require("../modules/GenerateToken.ts");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.MAIL);
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const vendors = require("../../constants/vendors.json");
// We will re-enable signup later

// TBD: Ratelimit 30 seconds via express-rate-limit w/ rate-limit-redis
router.post("/sendLoginCode", async (req, res) => {
    if (!req.body.auth || !req.body.vendor) return res.status(400).send()
    CanobalUser.findOne({ auth: req.body.auth }).then(async response => {
        // Check if vendor exists
        if (vendors[req.body.vendor] == undefined) return res.status(400).send();
        if (response == null) response = await CanobalUser.create({ id: uuidv4(), created: new Date(), authType: "email", "auth": req.body.auth, registeredVendors: [req.body.vendor], lastLogin: null, loginCode: null, loginVendor: null })

        // generate random 6 digit number
        let loginCode = Math.floor(100000 + Math.random() * 900000);

        await CanobalUser.updateOne({ auth: req.body.auth }, { loginCode: loginCode, loginVendor: req.body.vendor });
        if (response.authType == "phone") {
            // Not possible until release
            // https://support.twilio.com/hc/en-us/articles/11847054539547-A2P-10DLC-Campaign-Approval-Best-Practices
        } else if (response.authType == "email") {
            sgMail.send({
                to: req.body.auth,
                from: {
                    email: 'noreply+canoballabs@anolet.com',
                    name: vendors[req.body.vendor].name
                },
                subject: `${loginCode} is your code for ${vendors[req.body.vendor].name} login`,
                text: 'Login to ${req.body.vendor} with your Canobal Labs account using ' + loginCode + '.',
                html: fs.readFileSync('./notifications/login/email.html', 'utf8').replaceAll("${code}", loginCode).replaceAll("${vendor.name}", vendors[req.body.vendor].name).replaceAll("${vendor.logo}", vendors[req.body.vendor].logo)
            }).then(() => { res.send("Email sent") }).catch((error) => { res.send(error) });
        }
    });
});

router.post("/:code", async (req, res) => {
    if (!req.params.code || !req.body.auth || !req.body.vendor) return res.status(400).send()
    if (req.params.code.length != 6 || isNaN(req.params.code) || isNaN(parseFloat(req.params.code))) return res.status(400).send();

    CanobalUser.findOne({ auth: req.body.auth, loginCode: req.params.code, loginVendor: req.body.vendor }).then(async response => {
        if (response == null) return res.status(400).json({
            token: null,
            error: "An account with that auth and login code does not exist."
        });
        res.json({ token: GenerateToken(response.id, req.body.vendor), error: false });
        if (response.registeredVendors.includes(req.body.vendor)) {
            await CanobalUser.updateOne({ auth: req.body.auth }, { loginCode: null, loginVendor: null, lastLogin: new Date() });
        } else {
            await CanobalUser.updateOne({ auth: req.body.auth }, { $set: { loginCode: null, loginVendor: null, lastLogin: new Date() }, $push: { registeredVendors: req.body.vendor } });
        }
    });
});
