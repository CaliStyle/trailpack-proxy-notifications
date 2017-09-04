/* eslint new-cap: [0] */
/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const shortId = require('shortid')
const _ = require('lodash')
const Errors = require('proxy-engine-errors')
const helpers = require('proxy-engine-helpers')
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
              if (!values.subject) {
                values.subject = values.type
              }
              if (!values.html){
                values.html = app.services.RenderGenericService.renderSync(values.text).document
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
              const sendType = this.template_name ? 'sendTemplate' : 'send'
              if (this.send_email && this.send_email === false) {
                return Promise.resolve(this)
              }

              return this.resolveUsers({transaction: options.transaction || null})
                .then(() => {
                  // List of eligible users
                  const emailUsers = this.users && this.users.length > 0
                    ? this.users.filter(user => {
                      let send = true
                      // Migration Insurance
                      user.preferences = user.preferences || {}
                      user.preferences.email = typeof user.preferences.email !== 'undefined' ?
                        user.preferences.email : {}

                      // If user has no email
                      if (typeof user.email === 'undefined' || !user.email) {
                        send = false
                      }
                      // If user's email preferences are all false
                      else if (
                        typeof user.preferences.email !== 'undefined'
                        && user.preferences.email === false
                      ) {
                        send = false
                      }
                      // If user doesn't want this type of email
                      else if (
                        typeof user.preferences.email !== 'undefined'
                        && user.preferences.email[this.type] === false
                      ) {
                        send = false
                      }
                      return send === true
                    }) : []

                  if (emailUsers.length > 0) {
                    const emailUsers = this.users.filter(user => user.email)
                    const users = emailUsers.map(user => {
                      if (user)
                        return {
                          email: user.email,
                          name: user.first_name || user.username || app.config.proxyNotifications.to.default_name
                        }
                    })
                    const message = {
                      protocol: this.protocol,
                      host: this.host,
                      subject: this.subject,
                      text: this.text,
                      html: this.html,
                      to: users,
                      reply_to: this.reply_to || app.config.proxyNotifications.from.email,
                      from: {
                        email: app.config.proxyNotifications.from.email,
                        name: app.config.proxyNotifications.from.name
                      },
                      template_name: this.template_name,
                      template_content: this.template_content
                    }

                    return app.services.EmailGenericService[sendType](message)
                      .catch(err => {
                        app.log.error(err)
                        return null
                      })

                  }
                  else {
                    return []
                  }
                })
                .then(emails => {
                  emails = emails.filter(email => email)
                  // console.log('TOTAL SENT', emails.length, this)
                  if (emails.length > 0) {
                    console.log('SET SENT', this.token, emails.length)
                    return this.setSent().save({ transaction: options.transaction || null})
                  }
                  else {
                    return this
                  }
                })
            },
            userOpened: function (user, options) {
              options = options || {}
              return app.orm['ItemNotification'].update({ opened: true },{
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
        // Protocol to send email
        protocol: {
          type: Sequelize.STRING,
          defaultValue: app.config.proxyGenerics.email_provider.options.protocol
        },
        // Host to send email from
        host: {
          type: Sequelize.STRING,
          defaultValue: app.config.proxyGenerics.email_provider.options.host
        },
        // Reply to value
        reply_to: {
          type: Sequelize.STRING,
          defaultValue: app.config.proxyGenerics.email_provider.options.reply_to
        },
        // The type of notification in dot notation
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        // The subject of the notification and email
        subject: {
          type: Sequelize.STRING
        },
        // The email template name for GenericEmailProvider
        template_name: {
          type: Sequelize.STRING
        },
        // Content for email template for GenericEmailProvider
        template_content: helpers.JSONB('Product', app, Sequelize, 'discounted_lines', {
          defaultValue: {}
        }),
        // Text version of the notification
        text: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        // Html version of the notification
        html: {
          type: Sequelize.TEXT
        },
        // If an email copy of the notification should be sent
        send_email: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        // If the email has been sent
        sent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        // When the email was sent
        sent_at: {
          type: Sequelize.DATE
        }
      }
    }
    return schema
  }
}
