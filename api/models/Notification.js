'use strict'

const Model = require('trails/model')
const shortId = require('shortid')
const _ = require('lodash')
const queryDefaults = require('../utils/queryDefaults')

/**
 * @module Notification
 * @description Notification
 */
module.exports = class Notification extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true,
          hooks: {
            beforeCreate: (values, options, fn) => {
              if (!values.token) {
                values.token = `notification_${shortId.generate()}`
              }
              fn()
            }
          },
          classMethods: {
            associate: (models) => {
              models.Notification.belongsTo(models.User, {
                as: 'user_id'
              })
            },
            findByIdDefault: function(id, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Notification.default(app))
              return this.findById(id, options)
            },
            findByTokenDefault: function(token, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Notification.default(app), {
                where: {
                  token: token
                }
              })
              return this.findOne(options)
            },
            findOneDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Notification.default(app))
              return this.findOne(options)
            },
            findAllDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Notification.default(app))
              return this.findAll(options)
            },
            findAndCountDefault: function(options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Notification.default(app))
              return this.findAndCount(options)
            }
          }
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        // Unique identifier for a particular notification.
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        type: {
          type: Sequelize.STRING
        },
        message: {
          type: Sequelize.TEXT
        }
      }
    }
    return schema
  }
}
