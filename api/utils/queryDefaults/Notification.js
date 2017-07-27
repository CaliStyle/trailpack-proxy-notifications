module.exports = {
  default: (app) => {
    return {
      include: [
        {
          model: app.orm['User'],
          as: 'users',
          duplicating: false
        }
      ]
    }
  }
}
