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
  create(notification, options) {
    options = options || {}
    const Notification = this.app.orm['Notification']
    return Notification.create(notification, options)
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
        // console.log('BROKE START', resNotification)
        return resNotification.resolveUser({transaction: options.transaction || null})
      })
      .then(() => {
        if (resNotification.User && resNotification.User.email) {
          return this.app.services.EmailGenericService.send({
            subject: resNotification.type,
            html: resNotification.message,
            to: [
              {
                email: resNotification.User.email,
                name: resNotification.User.first_name || this.app.config.proxyNotifications.to.default_name
              }
            ],
            from: {
              email: this.app.config.proxyNotifications.from.email,
              name: this.app.config.proxyNotifications.from.name
            }
          })
        }
        else {
          return []
        }
      })
      .then(emails => {
        if (emails.length > 0) {
          return resNotification.setSent().save({ transaction: options.transaction || null})
        }
        else {
          return resNotification
        }
      })
  }

  /**
   *
   * @param notification
   * @param options
   * @returns {Promise.<T>}
   */
  afterCreate(notification, options) {
    return this.sendNotification(notification, options)
      .then((sentNotification) => {
        return sentNotification
      })
      .catch(err => {
        return notification
      })
  }
}

