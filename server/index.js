const fastify = require('fastify')({ logger: { level: 'debg' } })
const path = require('path')
const env = require('env-var')
const PORT = env.get('PORT', 8080).asInt()
const HOST = require('ip').address()

// Register the websocket server
fastify.register(require('./plugins/ws'))

// Serve static files (so you can use the parcel server or this)
fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../dist')
})

fastify.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    fastify.log.error('failed to start server')
    throw err
  } else {
    fastify.log.info(`listening on ${HOST}:${PORT}`)
  }
})

