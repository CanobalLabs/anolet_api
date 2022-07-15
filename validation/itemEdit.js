const { Joi } = require('express-validation')

module.exports = {
  body: Joi.object({
    name: Joi.string().min(1).max(255),
    description: Joi.string().min(1).max(255),
    type: Joi.string().valid('hat', 'face', 'body', 'shoes'),
    price: Joi.number().min(0),
    available: Joi.boolean(),
    saleEnd: Joi.date(),
    salePrice: Joi.number().min(0),
  }),
}