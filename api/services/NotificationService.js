/* eslint no-console: [0] */
'use strict'

const Service = require('trails-service')
const Errors = require('proxy-engine-errors')

/**
 * @module NotificationService
 * @description Notification Service
 */
module.exports = class NotificationService extends Service {
  /**
   *
   * @param notification
   * @param users
   * @param options
   */
  create(notification, users, options) {
    options = options || {}
    users = users || []
    const Notification = this.app.orm['Notification']
    const User = this.app.orm['User']

    let resNotification
    return Notification.createDefault(notification, options)
      .then(createdNotification => {
        if (!createdNotification) {
          throw new Error('Notification was not created')
        }

        resNotification = createdNotification

        return Notification.sequelize.Promise.mapSeries(users, user => {
          return User.resolve(user, {transaction: options.transaction || null})
        })
      })
      .then(_users => {
        _users = _users || []
        return resNotification.setUsers(_users.map(u => u.id), {transaction: options.transaction || null})
      })
      .then(() => {
        return resNotification.send({transaction: options.transaction})
      })
  }

  /**
   *
   * @param notification
   * @param options
   * @returns {Promise.<T>}
   */
  sendNotification(notification, options) {
    options = options || {}
    const Notification = this.app.orm['Notification']
    let resNotification
    return Notification.resolve(notification, options)
      .then(_notification => {
        if (!_notification) {
          throw new Errors.FoundError(Error(`Notification ${notification} not found`))
        }
        resNotification = _notification
        return resNotification.send({transaction: options.transaction || null})
      })
  }

  registerClick(notification, options) {
    options = options || {}
    const Notification = this.app.orm['Notification']
    const user = options.req && options.req.user ? options.req.user : null
    let resNotification
    return Notification.resolve(notification, options)
      .then(_notification => {
        if (!_notification) {
          throw new Errors.FoundError(Error(`Notification ${notification} not found`))
        }
        resNotification = _notification
        return resNotification.click(user, {transaction: options.transaction || null})
      })
      .then(() => {
        return resNotification.save({transaction: options.transaction || null})
      })
  }

  registerOpen(notification, options) {
    options = options || {}
    const Notification = this.app.orm['Notification']
    const user = options.req && options.req.user ? options.req.user : null
    let resNotification
    return Notification.resolve(notification, options)
      .then(_notification => {
        if (!_notification) {
          throw new Errors.FoundError(Error(`Notification ${notification} not found`))
        }
        resNotification = _notification
        return resNotification.open(user, {transaction: options.transaction || null})
      })
      .then(() => {
        return resNotification.save({transaction: options.transaction || null})
      })
  }

  /**
   *
   * @param notification
   * @param options
   * @returns {Promise.<T>}
   */
  afterCreate(notification, options) {
    return Promise.resolve(notification)
    // return this.sendNotification(notification, options)
    //   .then((sentNotification) => {
    //     return sentNotification
    //   })
    //   .catch(err => {
    //     return notification
    //   })
  }
}

