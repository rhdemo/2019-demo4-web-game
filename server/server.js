const env = require("env-var");
const log = require("./utils/log")("web-game-server");
const {OUTGOING_MESSAGE_TYPES} = require("./message-types");
const initData = require("./datagrid/init-data");
const initPlayers = require("./datagrid/init-players");
const {kafkaProducer} = require("./kafka-producer")
const socketServer = require("./socket-server");
const broadcast = require("./utils/broadcast");
const processSocketMessage = require("./socket-handlers/process-socket-message");
const pollMachines = require("./datagrid/poll-machines");

setInterval(function () {
  broadcast(OUTGOING_MESSAGE_TYPES.HEARTBEAT);
}, 5000);

initData()
  .then(() => initPlayers())
  .then(() => {
    socketServer.on("connection", function connection(ws) {
      ws.on("message", function incoming(message) {
        processSocketMessage(ws, message);
      });
    });
    pollMachines(1000);
    setTimeout(() => pollMachines(10000, true), 500);
  });



