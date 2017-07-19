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
   * @param options
   * @returns {notification}
   */
  create(notification, users, options) {
    options = options || {}
    const Notification = this.app.orm['Notification']
    let resNotification
    return Notification.createDefault(notification, options)
      .then(createdNotification => {
        if (!createdNotification) {
          throw new Error('Notification was not created')
        }
        resNotification = createdNotification
        return resNotification.setUsers(users)
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
      .then(foundNotification => {
        if (!foundNotification) {
          throw new Errors.FoundError(Error(`Notification ${notification} not found`))
        }
        resNotification = foundNotification
        return resNotification.send()
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

