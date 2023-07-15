const { Joi } = require("express-validation");

const JoiGuildMember = Joi.object({
    userId: Joi.string().regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i),
    roles: Joi.array().items(Joi.object({
        name: Joi.string().min(1).max(256).required().regex(/^[a-zA-Z0-9_.-]*$/),
        permissions: Joi.array().items(Joi.string().valid("placeholder")),
        hoist: Joi.number().min(1)
    }))
})

module.exports = {
    body: Joi.object({
        name: Joi.string().min(1).max(256).regex(/^[a-zA-Z0-9_.-]*$/),
        description: Joi.string().min(1).max(2048),
        visible: Joi.boolean(),
        security: Joi.string().valid("public", "apply", "invite"),
        owner: Joi.string().regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i),
        members: Joi.array().items(JoiGuildMember),
        pendingMembers: Joi.array().items(Joi.object({
            userId: Joi.string().regex(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i),
            content: Joi.string().min(0).max(2048)
        })),
        bannedMembers: Joi.array().items(Joi.string()),
        wall: Joi.array().items(Joi.object({
            member: JoiGuildMember,
            content: Joi.string().min(0).max(2048)
        })),
    })
}