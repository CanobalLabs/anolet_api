const { Joi } = require('express-validation')
module.exports = {
  body: Joi.object({
    username: Joi.string().min(3).max(20),
    about: Joi.string().min(0).max(300).allow(null)
  }),
}