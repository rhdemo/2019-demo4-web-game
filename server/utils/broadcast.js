const WebSocket = require("ws");
const socketServer = require("../socket-server");
const log = require("../utils/log")("broadcast");

function broadcast(type, data, action) {
  // log.debug("broadcast", type, data);
  const msg = JSON.stringify({type, data, action});

  if (socketServer.clients) {
    socketServer.clients.forEach(client => {
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

