const { Joi } = require('express-validation')
module.exports = {
  body: Joi.object({
    username: Joi.string().min(3).max(20).regex(/^[a-zA-Z0-9_.-]*$/),
    about: Joi.string().max(360),
    // Modifying gems can be done through transactions
  }),
}