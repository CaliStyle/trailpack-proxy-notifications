'use strict'

const joi = require('joi')
const lib = require('.')
// const Errors = require('proxy-engine-errors')

module.exports = {
  // Validate Proxy Cart
  validateProxyNotifications: {
    config(config){
      return new Promise((resolve, reject) => {
        joi.validate(config, lib.Schemas.proxyNotificationsConfig, (err, value) => {
          if (err) {
            return reject(new TypeError('config.proxyNotifications: ' + err))
          }
          return resolve(value)
        })
      })
    }
  },
}
