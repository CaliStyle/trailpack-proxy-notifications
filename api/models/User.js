/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
const ModelPassport = require('trailpack-proxy-passport/api/models/User')
const ModelPermissions = require('trailpack-proxy-permissions/api/models/User')
const _ = require('lodash')
// const shortid = require('shortid')

module.exports = class User extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        underscored: true,
        hooks: {
          afterCreate: ModelPermissions.config(app, Sequelize).options.hooks.afterCreate
        },
        getterMethods: {
        },
        classMethods: {
          associate: (models) => {
            // Apply passport specific stuff
            ModelPassport.config(app, Sequelize).options.classMethods.associate(models)
            // Apply permission specific stuff
            ModelPermissions.config(app, Sequelize).options.classMethods.associate(models)
            // Apply your specific stuff
            models.User.hasMany(models.Notification, {
              as: 'notifications',
              // through: {
              //   model: models.CartUser,
              //   foreignKey: 'user_id',
              //   unique: true,
              //   constraints: false
              // }
            })
          },
          findByIdDefault: ModelPermissions.config(app, Sequelize).options.classMethods.findByIdDefault,
          findOneDefault: ModelPermissions.config(app, Sequelize).options.classMethods.findOneDefault
        },
        instanceMethods: {
        }
      }
    }
  }
  static schema(app, Sequelize) {
    const PassportTrailpackSchema = ModelPassport.schema(app, Sequelize)
    const PermissionsTrailpackSchema = ModelPermissions.schema(app, Sequelize)

    const schema = {

    }
    return _.defaults(PassportTrailpackSchema, PermissionsTrailpackSchema, schema)
  }
}
