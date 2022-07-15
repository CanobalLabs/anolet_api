const { Joi } = require('express-validation')
module.exports = {
  body: Joi.object({
    username: Joi.string().min(3).max(20),
    password: Joi.string().min(8)
  }),
}