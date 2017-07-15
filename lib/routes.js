'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  // Notifications
  {
    method: ['GET'],
    path: '/notification',
    handler: 'NotificationController.findAll',
    config: {
      validate: {
        query: {
          offset: joi.number(),
          limit: joi.number(),
          sort: joi.string(),
          where: joi.any()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetNotificationRoute',
          roles: ['registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/notification/:id',
    handler: 'NotificationController.findById',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetNotificationIdRoute',
          roles: ['admin','registered']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/notification/token/:token',
    handler: 'NotificationController.findByToken',
    config: {
      validate: {
        params: {
          id: joi.any().required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetNotificationTokenTokenRoute',
          roles: ['admin','registered']
        }
      }
    }
  }
]
