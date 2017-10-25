/**
 * Trailpack Configuration
 *
 * @see {@link http://trailsjs.io/doc/trailpack/config
 */
module.exports = {
  type: 'misc',

  /**
   * API and config resources provided by this Trailpack.
   */
  provides: {
    api: {
      controllers: ['NotificationsController'],
      services: ['NotificationService'],
      models: ['User','Notification','ItemNotification']
    },
    config: [ ]
  },
  /**
   * Configure the lifecycle of this pack; that is, how it boots up, and which
   * order it loads relative to other trailpacks.
   */
  lifecycle: {
    configure: {
      /**
       * List of events that must be fired before the configure lifecycle
       * method is invoked on this Trailpack
       */
      listen: [
        'trailpack:proxy-sequelize:configured',
        'trailpack:proxy-engine:configured',
        'trailpack:proxy-generics:configured',
        'trailpack:proxy-permissions:configured'
      ],

      /**
       * List of events emitted by the configure lifecycle method
       */
      emit: [
        'trailpack:proxy-notifications:configured'
      ]
    },
    initialize: {
      listen: [
        'trailpack:proxy-sequelize:initialized',
        'trailpack:proxy-engine:initialized',
        'trailpack:proxy-permissions:initialized',
        'trailpack:proxy-generics:initialized'
      ],
      emit: [
        'trailpack:proxy-notifications:initialized'
      ]
    }
  }
}

