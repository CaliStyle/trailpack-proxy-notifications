'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')

describe('NotificationController', () => {
  let request, agent
  let NotificationService
  let Notification
  let User
  let userID

  before((done) => {
    request = supertest('http://localhost:3000')
    agent = supertest.agent(global.app.packs.express.server)

    agent
      .post('/auth/local')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'admin', password: 'admin1234'})
      .expect(200)
      .end((err, res) => {
        // console.log('THIS ADMIN', res.body)
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

  it('should get notifications', (done) => {
    agent
      .get('/notification')
      .expect(200)
      .end((err, res) => {
        // console.log('NOTIFICATIONS',res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.body.length, 0)
        assert.equal(res.headers['x-pagination-total'], '0')
        done(err)
      })
  })

  it('should get user notifications by user id', (done) => {
    agent
      .get(`/user/${ userID }/notifications`)
      .expect(200)
      .end((err, res) => {
        // console.log('NOTIFICATIONS', err, res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.body.length, 0)
        assert.equal(res.headers['x-pagination-total'], '0')

        done(err)
      })
  })
  it('should get user notifications', (done) => {
    agent
      .get('/user/notifications')
      .expect(200)
      .end((err, res) => {
        // console.log('NOTIFICATIONS', res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.equal(res.body.length, 0)
        assert.equal(res.headers['x-pagination-total'], '0')

        done(err)
      })
  })

})
