const { Joi } = require('express-validation')

module.exports = {
  body: Joi.object({
    hats: Joi.array().items(Joi.string()).max(3).required(),
    bodies: Joi.array().items(Joi.string()).min(1).max(1).required(),
    faces: Joi.array().items(Joi.string()).min(1).max(1).required(),
    shoes: Joi.array().items(Joi.string()).max(1).required(),
  }),
}