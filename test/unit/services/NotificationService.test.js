'use strict'
/* global describe, it */
const assert = require('assert')

describe('NotificationService', () => {
  let NotificationService
  let User
  let userId

  it('should exist', () => {
    assert(global.app.api.services['NotificationService'])
    assert(global.app.services['NotificationService'])
    NotificationService = global.app.services['NotificationService']
    User = global.app.orm['User']
  })
  it('should create a notification', (done) => {
    NotificationService.create({
      type: 'Test',
      message: 'Test Message'
    })
      .then(notification => {
        // console.log('THIS NOTIFICATION', notification)
        assert.ok(notification.id)
        assert.ok(notification.token)
        assert.equal(notification.type, 'Test')
        assert.equal(notification.message, 'Test Message')
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
          message: 'Test Message',
          user_id: user.id
        })
      })
      .then(notification => {
        // console.log('THIS NOTIFICATION', notification)
        assert.ok(notification.id)
        assert.ok(notification.token)
        assert.equal(notification.type, 'Test')
        assert.equal(notification.message, 'Test Message')
        assert.equal(notification.sent, true)
        assert.ok(notification.sent_at)
        assert.equal(notification.user_id, userId)

        done()
      })
      .catch(err => {
        done(err)
      })
  })
})
