'use strict'

const _ = require('lodash')
const smokesignals = require('smokesignals')
const fs = require('fs')
const path = require('path')

const SERVER = process.env.SERVER || 'express'
const ORM = process.env.ORM || 'sequelize'
const DIALECT = process.env.DIALECT || 'sqlite'

const packs = [
  require('trailpack-router'),
  require('trailpack-proxy-passport'),
  require('trailpack-proxy-engine'),
  require('trailpack-proxy-permissions'),
  require('trailpack-proxy-generics'),
  require('../') // trailpack-proxy-cart
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
      database: 'ProxyCart',
      host: '127.0.0.1',
      dialect: 'postgres'
    }
  }
  else {
    stores.sqlitedev = {
      database: 'ProxyCart',
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
  api: require('../api'),
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
        options: {}
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
