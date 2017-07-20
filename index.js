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
    // Configs
    if (!this.app.config.proxyEngine) {
      return Promise.reject(new Error('No configuration found at config.proxyEngine!'))
    }

    if (!this.app.config.proxyNotifications) {
      return Promise.reject(new Error('No configuration found at config.proxyNotifications!'))
    }

    if (!this.app.config.proxyGenerics) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics!'))
    }

    if (!this.app.config.proxyGenerics.email_provider) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics.email_provider!'))
    }
    if (!this.app.config.proxyGenerics.email_provider.options) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics.email_provider.options!'))
    }
    if (!this.app.config.proxyGenerics.email_provider.options.protocol) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics.email_provider.options.protocol!'))
    }
    if (!this.app.config.proxyGenerics.email_provider.options.host) {
      return Promise.reject(new Error('No configuration found at config.proxyGenerics.email_provider.options.host!'))
    }

    return Promise.all([
      lib.Validator.validateProxyNotifications.config(this.app.config.proxyNotifications)
    ])
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

