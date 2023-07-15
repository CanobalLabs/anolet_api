const { Joi } = require('express-validation')

module.exports = {
  body: Joi.object({
    name: Joi.string().min(1).max(256),
    description: Joi.string().min(1).max(2048),
    type: Joi.string().valid('accessory', 'face', 'body', 'shoes'),
    price: Joi.number().integer().min(0),
    available: Joi.boolean(),
    saleEnd: Joi.date(),
    salePrice: Joi.number().integer().min(0),
    anoletAccount: Joi.boolean()
  }),
}
