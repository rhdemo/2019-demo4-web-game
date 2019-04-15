const WebSocket = require("ws");
const log = require("../utils/log")("broadcast");

function broadcast(type, data, action) {
  // log.debug("broadcast", type, data);
  const msg = JSON.stringify({type, data, action});

  if (global.socketServer.clients) {
    global.socketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(msg);
        } catch (error) {
          log.error(`Failed to broadcast message to client.  Error: ${error.message}`)
        }
      }
    });
  }
}

module.exports = broadcast;

