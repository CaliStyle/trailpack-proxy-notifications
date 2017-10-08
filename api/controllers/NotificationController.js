/* eslint no-console: [0] */
'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')

/**
 * @module NotificationController
 * @description Controller for Notifications
 */
module.exports = class NotificationController extends Controller {
  /**
   * Find notification by id
   * @param req
   * @param res
   */
  findById(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']

    if (!req.params.id) {
      const err = new Error('Notification missing identifier')
      return res.serverError(err)
    }

    Notification.findByIdDefault(req.params.id, {})
      .then(notification => {
        if (!notification) {
          throw new Errors.FoundError(Error(`Notification id ${ req.params.id } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, notification)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Finds notification by token
   * @param req
   * @param res
   */
  findByToken(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']

    if (!req.params.token) {
      const err = new Error('Notification missing identifier')
      return res.serverError(err)
    }

    Notification.findByTokenDefault(req.params.token)
      .then(notification => {
        if (!notification) {
          throw new Errors.FoundError(Error(`Notification token ${ req.params.token } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, notification)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   * Resolves either a notification id or a token
   * @param req
   * @param res
   */
  resolve(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']

    if (!req.params.notification) {
      const err = new Error('Notification missing identifier')
      return res.serverError(err)
    }

    Notification.resolve(req.params.notification)
      .then(notification => {
        if (!notification) {
          throw new Errors.FoundError(Error(`Notification ${ req.params.notification } not found`))
        }
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, notification)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  findAll(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || 'created_at DESC'
    const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)
    Notification.findAndCountDefault({
      where: where,
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(notifications => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, notifications.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, notifications.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }

  /**
   *
   * @param req
   * @param res
   */
  userNotifications(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']
    const limit = Math.max(0, req.query.limit || 10)
    const offset = Math.max(0, req.query.offset || 0)
    const sort = req.query.sort || 'created_at DESC'
    // const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    if (!req.user && !req.params.id) {
      const err = new Error('A user in session is required')
      return res.status(401).send(err)
    }

    let id = req.params.id
    if (!id && req.user) {
      id = req.user.id
    }

    if (!id) {
      const err = new Error('A user in session or an id is required')
      return res.status(401).send(err)
    }
    Notification.findAndCountDefault({
      include: [
        {
          model: this.app.orm['User'],
          as: 'users',
          where: {
            id: id
          }
        }
      ],
      order: sort,
      offset: offset,
      // limit: limit
    })
      .then(notifications => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, notifications.count, limit, offset, sort)
        return this.app.services.ProxyPermissionsService.sanitizeResult(req, notifications.rows)
      })
      .then(result => {
        return res.json(result)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

