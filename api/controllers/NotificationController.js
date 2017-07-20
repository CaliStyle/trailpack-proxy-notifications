'use strict'

const Controller = require('trails/controller')
const Errors = require('proxy-engine-errors')

/**
 * @module NotificationController
 * @description Controller for Notifications
 */
module.exports = class NotificationController extends Controller {
  /**
   *
   * @param req
   * @param res
   */
  findById(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']
    Notification.findByIdDefault(req.params.id, {})
      .then(notification => {
        if (!notification) {
          throw new Errors.FoundError(Error(`Notification id ${ req.params.id } not found`))
        }
        return res.json(notification)
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
  findByToken(req, res) {
    const orm = this.app.orm
    const Notification = orm['Notification']
    Notification.findByTokenDefault(req.params.token)
      .then(notification => {
        if (!notification) {
          throw new Errors.FoundError(Error(`Notification handle ${ req.params.token } not found`))
        }
        return res.json(notification)
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
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
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
        return res.json(notifications.rows)
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
    const limit = req.query.limit || 10
    const offset = req.query.offset || 0
    const sort = req.query.sort || 'created_at DESC'
    // const where = this.app.services.ProxyEngineService.jsonCritera(req.query.where)

    if (!req.user || req.params.id) {
      const err = new Error('A user in session is required')
      return res.send(401, err)
    }

    let id = req.params.id
    if (!id && req.user) {
      id = req.user.id
    }

    Notification.findAndCountDefault({
      where: {
        '$users.id$': id
      },
      order: sort,
      offset: offset,
      limit: limit
    })
      .then(notifications => {
        // Paginate
        this.app.services.ProxyEngineService.paginate(res, notifications.count, limit, offset, sort)
        return res.json(notifications.rows)
      })
      .catch(err => {
        return res.serverError(err)
      })
  }
}

