
/**
 * Bind a websocket server to the given fastify server
 * @param server {fastify}
 */
module.exports = function (fastify, options, next) {
  const WebSocket = require('ws')
  const wss = new WebSocket.Server({ server: fastify.server })

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      fastify.log.debug('wss received: %s', message);
    });

    ws.on('error', (e) => fastify.log.error('websocket error', e))

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function sendRandomState () {
      const states = ['active', 'paused', 'stopped']
      const s = states[getRandomInt(0, 2)]

      fastify.log.debug('sending state of "%s" to client', s)

      ws.send(JSON.stringify({
        gameState: s,
        type: 'config'
      }))

      setTimeout(sendRandomState, getRandomInt(1000, 5000))
    }

    // Wait before sending initial payload
    setTimeout(sendRandomState, 1000)
  });

  next()
}
