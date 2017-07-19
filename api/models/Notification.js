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
              models.Notification.belongsToMany(models.User, {
                as: 'users',
                through: {
                  model: models.ItemNotification,
                  unique: false,
                  scope: {
                    model: 'user'
                  }
                },
                foreignKey: 'notification_id',
                constraints: false
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
            createDefault: function(notification, options) {
              options = options || {}
              options = _.defaultsDeep(options, queryDefaults.Notification.default(app))
              return this.create(notification, options)
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
            send: function(options) {
              options = options || {}
              return this.resolveUsers({transaction: options.transaction || null})
                .then(() => {
                  if (this.users && this.users.length > 0) {
                    const emailUsers = this.users.filter(user => user.email)
                    const users = emailUsers.map(user => {
                      if (user)
                        return {
                          email: user.email,
                          name: user.first_name || app.config.proxyNotifications.to.default_name
                        }
                    })
                    const message = {
                      subject: this.type,
                      html: this.message,
                      to: users,
                      from: {
                        email: app.config.proxyNotifications.from.email,
                        name: app.config.proxyNotifications.from.name
                      }
                    }
                    if (this.template) {
                      return app.services.EmailGenericService.sendTemplate(message)
                    }
                    else {
                      return app.services.EmailGenericService.send(message)
                    }
                  }
                  else {
                    return []
                  }
                })
                .then(emails => {
                  // console.log('BROKE', emails)
                  if (emails.length > 0) {
                    return this.setSent().save({ transaction: options.transaction || null})
                  }
                  else {
                    return this
                  }
                })
            },
            userOpened: function (user, options) {
              options = options || {}
              return app.orm['ItemNotification'].update({opened: true},{
                where: {
                  notification_id: this.id,
                  model: 'user',
                  model_id: user.id
                },
                transaction: options.transaction || null
              })
                .then(() => {
                  return this
                })
            },
            resolveUsers: function(options) {
              options = options || {}
              // console.log('BROKE HERE',this)
              if (this.users) {
                return Promise.resolve(this)
              }
              else {
                return this.getUsers({transaction: options.transaction || null})
                  .then(users => {
                    users = users || []
                    this.users = users
                    this.setDataValue('users', users)
                    this.set('users', users)
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