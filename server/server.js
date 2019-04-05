const WebSocket = require("ws");
const env = require("env-var");
const log = require("./utils/log")("web-game-server");
const {OUTGOING_MESSAGE_TYPES} = require("./message-types");
const initData = require("./datagrid/init-data");
const {kafkaProducer} = require("./kafka-producer")
const processSocketMessage = require("./socket-handlers/process-socket-message");

const PORT = env.get("PORT", "8080").asIntPositive();
const IP = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

global.game = {
    id: null,
    state: "loading",
    shakeDemo: {
        enabled: true,
        multiplier: 2,
        maxPerSecond: 5000
    },
    motions: {
        shake: false,
        circle: false,
        x: false,
        roll: false,
        fever: false,
        floss: false,
    }
}

global.players = {};

global.socketServer = new WebSocket.Server({
  host: IP,
  port: PORT
});

global.dataClient = null;

setInterval(function () {
    if (kafkaProducer.isConnected()) {
        log.info("kafka producer connected");
    } else {
        log.error("kafka producer disconnected");
    }

    if (global.socketServer.clients) {
    log.info(`sending heartbeats to connected clients`);
    global.socketServer.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type: OUTGOING_MESSAGE_TYPES.HEARTBEAT}));
      }
    });
  }
}, 5000);


initData()
  .then(client => {
    global.socketServer.on("connection", function connection(ws) {
      ws.on("message", function incoming(message) {
        processSocketMessage(ws, message);
      });
    });
  });



