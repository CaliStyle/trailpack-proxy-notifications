'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Registered NotificationController', () => {
  let request, registeredUser
  let NotificationService
  let Notification
  let User
  let userID

  before((done) => {
    request = supertest('http://localhost:3000')
    registeredUser = supertest.agent(global.app.packs.express.server)

    registeredUser.post('/auth/local/register')
      .send({
        email: 'notificationcontroller@example.com',
        password: 'admin1234'
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        userID = res.body.user.id
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.controllers['NotificationController'])
    NotificationService = global.app.services['NotificationService']
    Notification = global.app.orm['Notification']
    User = global.app.orm['User']
  })

  it('should not get notifications', (done) => {
    registeredUser
      .get('/notifications')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })

  it('should not get user notifications by user id', (done) => {
    registeredUser
      .get(`/user/${ userID }/notifications`)
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should get user notifications', (done) => {
    registeredUser
      .get('/user/notifications')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.equal(res.body.length, 0)
        assert.equal(res.headers['x-pagination-total'], '0')

        done(err)
      })
  })
})
