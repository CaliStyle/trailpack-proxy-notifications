'use strict'
const joi = require('joi')

module.exports =  joi.object().keys({
  to: joi.object().keys({
    default_name: joi.string()
  }),
  from: joi.object().keys({
    name: joi.string(),
    email: joi.string()
  })
})
