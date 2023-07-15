const { Joi } = require('express-validation')

module.exports = {
  body: Joi.object({
    name: Joi.string().min(1).max(256).required(),
    description: Joi.string().min(1).max(2048).required(),
    type: Joi.string().valid('accessory', 'face', 'body', 'shoes').required(),
    price: Joi.number().integer().min(0),
    anoletAccount: Joi.boolean()
  }),
}
