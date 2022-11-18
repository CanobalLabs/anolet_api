const { Joi } = require('express-validation')

module.exports = {
  body: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    description: Joi.string().min(1).max(255).required(),
    type: Joi.string().valid('accessory', 'face', 'body', 'shoes').required(),
    price: Joi.number().min(0).required(),
    anoletAccount: Joi.boolean()
  }),
}
