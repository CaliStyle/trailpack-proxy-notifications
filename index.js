'use strict'

const Trailpack = require('trailpack')
const _ = require('lodash')
const lib = require('./lib')

module.exports = class ProxyNotificationsTrailpack extends Trailpack {

  /**
   * Validates Configs
   */
  validate () {
    // Packs
    if (!_.includes(_.keys(this.app.packs), 'express')) {
      return Promise.reject(new Error('This Trailpack only works for express!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'sequelize')) {
      return Promise.reject(new Error('This Trailpack only works for Sequelize!'))
    }

    if (!_.includes(_.keys(this.app.packs), 'proxy-engine')) {
      return Promise.reject(new Error('This Trailpack requires trailpack-proxy-engine!'))
    }
    return Promise.resolve()
  }

  /**
   * TODO document method
   */
  configure () {
    return Promise.all([
      lib.ProxyNotifications.configure(this.app),
      lib.ProxyNotifications.addPolicies(this.app),
      lib.ProxyNotifications.addRoutes(this.app),
      lib.ProxyNotifications.resolveGenerics(this.app),
      lib.ProxyNotifications.copyDefaults(this.app),
      lib.ProxyNotifications.addCrons(this.app),
      lib.ProxyNotifications.addEvents(this.app),
      lib.ProxyNotifications.addTasks(this.app)
    ])
  }

  /**
   * TODO document method
   */
  initialize () {

  }

  constructor (app) {
    super(app, {
      config: require('./config'),
      api: require('./api'),
      pkg: require('./package')
    })
  }
}

