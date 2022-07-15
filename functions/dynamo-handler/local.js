const { handler } = require('./index')


handler()
    .then(console.log)
    .catch(console.error)

