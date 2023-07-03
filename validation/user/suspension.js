const { Joi } = require('express-validation')
module.exports = {
  body: Joi.object({
    source: Joi.string().uri({
      scheme: ['http', 'https']
    }),
    sourceName: Joi.string(),
    sourceContent: Joi.string(),
    // Make changes to schemas/suspension.js@L10 also
    sourceContentType: Joi.string().valid("profile_username", "chat_message", "game_metadata", "game_content", "group", "profile_description", "profile_picture", "other", "powerup"),
    reason: Joi.string().required(),
    suspensionEnd: Joi.date().iso().min(new Date()).required(),
    internalNote: Joi.string(),
    usernameChange: Joi.boolean().default(false)
  }).with('sourceName', ['sourceContent', 'sourceContentType']),
}