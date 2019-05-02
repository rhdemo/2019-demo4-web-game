const WebSocket = require("ws");
const env = require("env-var");
const log = require("./utils/log")("web-game-server");
const {OUTGOING_MESSAGE_TYPES} = require("./message-types");
const machines = require("./models/machines");
const {kafkaProducer} = require("./kafka-producer")
const broadcast = require("./utils/broadcast");
const logHeap = require("./utils/log-heap");
const processSocketMessage = require("./socket-handlers/process-socket-message");
require("./datagrid/enable-logging");
const initData = require("./datagrid/init-data");
const initPlayers = require("./datagrid/init-players");
const initLeaderboard = require("./datagrid/init-leaderboard");
const pollDatagrid = require("./datagrid/poll-datagrid");
const pollMachines = require("./datagrid/poll-machines");

const PORT = env.get("PORT", "8080").asIntPositive();
const IP = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0";

global.game = {
    id: null,
    state: "loading",
    shakeDemo: {
        enabled: true,
        multiplier: 2,
        maxPerSecond: 1000
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

global.machines = machines;

global.leaderboard = {
  players: []
};

global.players = {};

global.socketServer = new WebSocket.Server({
  host: IP,
  port: PORT
});

global.dataClient = null;
global.playerClient = null;

log.info(`Started Game server on ${IP}:${PORT}`);

setInterval(function () {
  broadcast(OUTGOING_MESSAGE_TYPES.HEARTBEAT);
  logHeap();
}, 5000);


initData()
  .then(() => initPlayers())
  .then(() => initLeaderboard())
  .then(() => {
    global.socketServer.on("connection", function connection(ws) {
      ws.on("message", function incoming(message) {
        processSocketMessage(ws, message);
      });
    });
    pollDatagrid(5000);
    pollMachines(1000);
  });

