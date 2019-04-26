const WebSocket = require("ws");
const log = require("../utils/log")("send");

async function send(ws, msg) {
  // log.debug("send", msg);
  try {
    if (ws.readyState === WebSocket.OPEN) {
      return await ws.send(msg);
    } else {
      log.warn("Attempted to send message on closed socket");
    }
  } catch (error) {
    log.error("Failed to send message.  Error: ", error.message);
  }
}

module.exports = send;

