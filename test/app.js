'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
const path = require('path')
const ModelPassport = require('trailpack-proxy-passport/api/models/User')
const ModelPermissions = require('trailpack-proxy-permissions/api/models/User')
const Model = require('trails/model')

const SERVER = process.env.SERVER || 'express'
const ORM = process.env.ORM || 'sequelize'
const DIALECT = process.env.DIALECT || 'sqlite'

const packs = [
  require('trailpack-router'),
  require('trailpack-proxy-engine'),
  require('trailpack-proxy-passport'),
  require('trailpack-proxy-permissions'),
  require('trailpack-proxy-generics'),
  require('../') // trailpack-proxy-notifications
]

let web = {}

const stores = {
  sqlitedev: {
    adapter: require('sails-disk')
  },
  uploads: {
    database: 'ProxyNotifications',
    storage: './test/test.uploads.sqlite',
    host: '127.0.0.1',
    dialect: 'sqlite'
  }
}

if (ORM === 'waterline') {
  packs.push(require('trailpack-waterline'))
}
else if (ORM === 'sequelize') {
  packs.push(require('trailpack-sequelize'))
  if (DIALECT == 'postgres') {
    stores.sqlitedev = {
      database: 'ProxyNotifications',
      host: '127.0.0.1',
      dialect: 'postgres'
    }
  }
  else {
    stores.sqlitedev = {
      database: 'ProxyNotifications',
      storage: './test/test.sqlite',
      host: '127.0.0.1',
      dialect: 'sqlite'
    }
  }
}

if ( SERVER == 'express' ) {
  packs.push(require('trailpack-express'))
  web = {
    express: require('express'),
    middlewares: {
      order: [
        'static',
        'addMethods',
        'cookieParser',
        'session',
        'bodyParser',
        'passportInit',
        'passportSession',
        'methodOverride',
        'router',
        'www',
        '404',
        '500'
      ],
      static: require('express').static('test/static')
    }
  }
}

const App = {
  api: {
    models: {
      User: class User extends ModelPassport {
        static config(app, Sequelize) {
          return {
            options: {
              underscored: true,
              hooks: {
                afterCreate: ModelPermissions.config(app, Sequelize).options.hooks.afterCreate
              },
              classMethods: {
                associate: (models) => {
                  models.User.belongsToMany(models.Notification, {
                    as: 'notifications',
                    through: {
                      model: models.ItemNotification,
                      unique: false,
                      scope: {
                        model: 'user'
                      }
                    },
                    foreignKey: 'model_id',
                    constraints: false
                  })
                  ModelPassport.config(app, Sequelize).options.classMethods.associate(models)
                  ModelPermissions.config(app, Sequelize).options.classMethods.associate(models)
                },
                findByIdDefault: ModelPermissions.config(app, Sequelize).options.classMethods.findByIdDefault,
                findOneDefault: ModelPermissions.config(app, Sequelize).options.classMethods.findOneDefault
              },
              instanceMethods: _.defaults({}, ModelPermissions.config(app, Sequelize).options.instanceMethods)
            }
          }
        }
        static schema(app, Sequelize) {
          const PassportTrailpackSchema = ModelPassport.schema(app, Sequelize)
          const PermissionsTrailpackSchema = ModelPermissions.schema(app, Sequelize)
          return _.defaults({}, PassportTrailpackSchema, PermissionsTrailpackSchema)
        }
      }
    }
  },
  pkg: {
    name: 'trailpack-proxy-cart-test',
    version: '1.0.0'
  },
  config: {
    database: {
      stores: stores,
      models: {
        defaultStore: 'sqlitedev',
        migrate: 'drop'
      }
    },
    routes: [],
    main: {
      packs: packs
    },
    policies: {
      // '*': [ 'CheckPermissions.checkRoute' ]
    },
    log: {
      logger: new smokesignals.Logger('debug')
    },
    web: web,
    session: {
      secret: 'proxyNotifications'
    },
    proxyNotifications: {
      to: {
        // The default name to use if the user has no specified name
        default_name: 'Valued Customer'
      },
      from: {
        // The email to send this notification from
        email: 'test.com',
        // The name of the email sending this notification
        name: 'Test'
      }
    },
    proxyPassport: {
      strategies: {
        local: {
          strategy: require('passport-local').Strategy
        }
      }
    },
    proxyPermissions: {
      defaultRole: 'public',
      defaultRegisteredRole: 'registered',
      modelsAsResources: true,
      fixtures: {
        roles: [{
          name: 'admin',
          public_name: 'Admin'
        }, {
          name: 'registered' ,
          public_name: 'Registered'
        }, {
          name: 'public' ,
          public_name: 'Public'
        }],
        permissions: []
      },
      defaultAdminUsername: 'admin',
      defaultAdminPassword: 'admin1234'
    },
    // Proxy Generics
    proxyGenerics: {
      email_provider: {
        adapter: require('./fixtures/FakeEmail'),
        options: {
          host: 'test.com',
          protocol: 'https'
        }
      }
    },
    proxyEngine: {
      live_mode: false,
      worker: 'testProfile'
    }
  }
}

const dbPath = path.resolve(__dirname, './test.sqlite')
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
}

const uploadPath = path.resolve(__dirname, './test.uploads.sqlite')
if (fs.existsSync(uploadPath)) {
  fs.unlinkSync(uploadPath)
}

_.defaultsDeep(App, smokesignals.FailsafeConfig)
module.exports = App
