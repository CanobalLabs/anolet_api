const { Joi } = require("express-validation");

module.exports = class GangValidator {
    static create() {
        return {
            body: Joi.object({
                realName: Joi.string().min(1).max(256).regex(/^[a-zA-Z0-9_.-]*$/).required(),
                displayName: Joi.string().min(1).max(256).required(),
                description: Joi.string().min(1).max(2048).required(),
                visible: Joi.boolean().default(true),
                security: Joi.string().valid("public", "apply", "invite").required(),
            })
        }
    }

    static update() {
        return {
            body: Joi.object({
                displayName: Joi.string().min(1).max(256),
                realName: Joi.string().min(1).max(256).regex(/^[a-zA-Z0-9_.-]*$/),
                description: Joi.string().min(1).max(2048),
                visible: Joi.boolean(),
                security: Joi.string().valid("public", "apply", "invite"),
                owner: Joi.string().regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i),
                defaultRole: Joi.number().min(0).max(1024)
            })
        }
    }

    static roleCreate() {
        return {
            body: Joi.object({
                name: Joi.string().min(1).max(256).required(),
                permissions: Joi.array().items(Joi.string().valid("UPDATE_GANG", "UPLOAD_ICON", "BAN_MEMBERS", "UPDATE_APPLICATIONS", "SEND_MESSAGES", "*")).required(),
                hoist: Joi.number().integer().min(0).default(0)
            })
        }
    }

    static roleUpdate() {
        return {
            body: Joi.object({
                name: Joi.string().min(1).max(256),
                permissions: Joi.array().items(Joi.string().valid("UPDATE_GANG", "UPLOAD_ICON", "BAN_MEMBERS", "UPDATE_APPLICATIONS", "SEND_MESSAGES", "*")),
                hoist: Joi.number().integer().min(0)
            })
        }
    }

    static memberKick() {
        return {
            body: Joi.object({
                reason: Joi.string().min(1).max(2048).required()
            })
        }
    }

    static memberWarn() {
        return {
            body: Joi.object({
                reason: Joi.string().min(1).max(2048).required(),
                expires: Joi.date().required()
            })
        }
    }

    static memberBan() {
        return {
            body: Joi.object({
                reason: Joi.string().min(1).max(2048).required(),
                expires: Joi.date().required()
            })
        }
    }

    static memberGameBan() {
        return {
            body: Joi.object({
                reason: Joi.string().min(1).max(2048).required(),
                expires: Joi.date().required()
            })
        }
    }

    static memberMute() {
        return {
            body: Joi.object({
                reason: Joi.string().min(1).max(2048).required(),
                expires: Joi.date().required()
            })
        }
    }

    static messageCreate() {
        return {
            body: Joi.object({
                member: Joi.string().regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i).required(),
                content: Joi.string().min(1).max(2048).required()
            })
        }
    }

    static applicationCreate() {
        return {
            body: Joi.object({
                member: Joi.string().regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i).required(),
                content: Joi.string().min(1).max(2048).required()
            })
        }
    }
}
