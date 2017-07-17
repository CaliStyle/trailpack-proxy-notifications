/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const shortId = require('shortid')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
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
            },
            afterCreate: (values, options, fn) => {
              app.services.NotificationService.afterCreate(values, options)
                .then(values => {
                  return fn(null, values)
                })
                .catch(err => {
                  return fn(err)
                })
            }
          },
          classMethods: {
            associate: (models) => {
              models.Notification.belongsTo(models.User, {
                foreignKey: 'user_id'
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
            },
            resolve: function(notification, options){
              options = options || {}
              const Notification =  this
              if (notification instanceof Notification.Instance){
                return Promise.resolve(notification)
              }
              else if (notification && _.isObject(notification) && notification.id) {
                return Notification.findByIdDefault(notification.id, options)
                  .then(resNotification => {
                    if (!resNotification) {
                      throw new Errors.FoundError(Error(`Notification ${notification.id} not found`))
                    }
                    return resNotification
                  })
              }
              else if (notification && (_.isNumber(notification))) {
                return Notification.findByIdDefault(notification, options)
                  .then(resNotification => {
                    if (!resNotification) {
                      throw new Errors.FoundError(Error(`Notification ${notification} not found`))
                    }
                    return resNotification
                  })
              }
              else if (notification && (_.isString(notification))) {
                return Notification.findByTokenDefault(notification, options)
                  .then(resNotification => {
                    if (!resNotification) {
                      throw new Errors.FoundError(Error(`Notification ${notification} not found`))
                    }
                    return resNotification
                  })
              }
              else {
                // TODO create proper error
                const err = new Error('Unable to resolve Notification')
                return Promise.reject(err)
              }
            }
          },
          instanceMethods: {
            setSent: function() {
              this.sent = true
              this.sent_at = new Date(Date.now())
              return this
            },
            resolveUser: function(options) {
              options = options || {}
              // console.log('BROKE HERE',this)
              if (this.User) {
                return Promise.resolve(this)
              }
              else {
                return this.getUser({transaction: options.transaction || null})
                  .then(user => {
                    user = user || null
                    this.User = user
                    this.setDataValue('User', user)
                    this.set('User', user)
                    return this
                  })
              }
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
        template: {
          type: Sequelize.STRING
        },
        message: {
          type: Sequelize.TEXT
        },
        sent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        sent_at: {
          type: Sequelize.DATE
        }
      }
    }
    return schema
  }
}
