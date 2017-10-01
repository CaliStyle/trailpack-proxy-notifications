'use strict'
const joi = require('joi')
// const Schemas = require('./schemas')

module.exports = [
  // Notifications
  {
    method: ['GET'],
    path: '/notifications',
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
          resource_name: 'apiGetNotificationsRoute',
          roles: ['admin']
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
          roles: ['admin']
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
          token: joi.string().required()
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
  },
  {
    method: ['GET'],
    path: '/user/notifications',
    handler: 'NotificationController.userNotifications',
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
          resource_name: 'apiGetUserNotificationsRoute',
          roles: ['registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/user/notifications/:notification',
    handler: 'NotificationController.resolve',
    config: {
      validate: {
        params: {
          notification: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        }
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetUserNotificationsIdRoute',
          roles: ['registered','admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/user/:id/notifications',
    handler: 'NotificationController.userNotifications',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
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
          resource_name: 'apiGetUserIdNotificationsRoute',
          roles: ['admin']
        }
      }
    }
  },
  {
    method: ['GET'],
    path: '/user/:id/notifications/:notification',
    handler: 'NotificationController.resolve',
    config: {
      validate: {
        params: {
          id: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required(),
          notification: joi.alternatives().try(
            joi.number(),
            joi.string()
          ).required()
        },
      },
      app: {
        proxyRouter: {
          ignore: true
        },
        proxyPermissions: {
          resource_name: 'apiGetUserIdNotificationsNotificationRoute',
          roles: ['admin']
        }
      }
    }
  }
]
