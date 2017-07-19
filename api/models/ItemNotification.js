'use strict'

const Model = require('trails/model')

/**
 * @module ItemNotification
 * @description Item Notification
 */
module.exports = class ItemNotification extends Model {

  static config (app, Sequelize) {
    let config = {}
    if (app.config.database.orm === 'sequelize') {
      config = {
        options: {
          underscored: true
        }
      }
    }
    return config
  }

  static schema (app, Sequelize) {
    let schema = {}
    if (app.config.database.orm === 'sequelize') {
      schema = {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        notification_id: {
          type: Sequelize.INTEGER,
          unique: 'notification_model'
        },
        model: {
          type: Sequelize.STRING,
          unique: 'notification_model'
        },
        model_id: {
          type: Sequelize.INTEGER,
          unique: 'notification_model',
          references: null
        },
        opened: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      }
    }
    return schema
  }
}
