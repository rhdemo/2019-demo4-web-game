const WebSocket = require("ws");
const env = require("env-var");
const log = require("./utils/log")("web-game-server");

const PORT = env.get("PORT", "8080").asIntPositive();
const IP = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

const socketServer = new WebSocket.Server({
  host: IP,
  port: PORT
});

log.info(`Started Game server on ${IP}:${PORT}`);

module.exports = socketServer
