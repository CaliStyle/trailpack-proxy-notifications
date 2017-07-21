/* eslint no-console: [0] */
'use strict'

const Model = require('trails/model')
// const _ = require('lodash')
// const shortid = require('shortid')

module.exports = class User extends Model {
  static config(app, Sequelize) {
    return {
      options: {
        underscored: true,
        getterMethods: {
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
          }
        },
        instanceMethods: {
        }
      }
    }
  }
  static schema(app, Sequelize) {
    const schema = {}
    return schema
  }
}
