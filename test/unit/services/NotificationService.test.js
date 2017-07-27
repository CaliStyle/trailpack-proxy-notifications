'use strict'
/* global describe, it */
const assert = require('assert')

describe('NotificationService', () => {
  let NotificationService
  let Notification
  let User
  let userId

  it('should exist', () => {
    assert(global.app.api.services['NotificationService'])
    assert(global.app.services['NotificationService'])
    NotificationService = global.app.services['NotificationService']
    Notification = global.app.orm['Notification']
    User = global.app.orm['User']
  })
  it('should create a notification', (done) => {
    NotificationService.create({
      type: 'Test',
      text: 'Test Message'
    })
      .then(notification => {
        // console.log('THIS NOTIFICATION', notification)
        assert.ok(notification.id)
        assert.ok(notification.token)
        assert.equal(notification.type, 'Test')
        assert.equal(notification.subject, 'Test')
        assert.equal(notification.text, 'Test Message')
        assert.equal(notification.html, '<p>Test Message</p>\n')
        assert.equal(notification.sent, false)

        done()
      })
      .catch(err => {
        done(err)
      })
  })
  it('should create a notification and send it', (done) => {
    User.create({
      email: 'scott@calistyletechnologies.com',
      first_name: 'Scott'
    })
      .then(user => {
        userId = user.id
        assert.ok(user.id)
        return NotificationService.create({
          type: 'Test',
          text: 'Test Message'
        }, [user.id])
      })
      .then(notification => {
        // console.log('THIS NOTIFICATION', notification)
        assert.ok(notification.id)
        assert.ok(notification.token)
        assert.equal(notification.type, 'Test')
        assert.equal(notification.subject, 'Test')
        assert.equal(notification.text, 'Test Message')
        assert.equal(notification.html, '<p>Test Message</p>\n')
        assert.equal(notification.send_email, true)
        assert.equal(notification.sent, true)
        assert.ok(notification.sent_at)
        assert.equal(notification.users.length, 1)

        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
