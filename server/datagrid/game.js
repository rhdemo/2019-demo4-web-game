const WebSocket = require("ws");
const log = require("../utils/log")("datagrid/game");
const send = require("../utils/send");
const Configuration = require("../models/configuration");
const readGame = require("./read-game");
const connectPlayer = require("../socket-handlers/connect-player");

async function gameHandler(client, changeType, key) {
  log.info("Game change");

  const originalId = global.game ? global.game.id : null;
  await readGame();

  if (originalId !== global.game.id) {
    refreshConnections();
  } else {
    sendGameConfigs();
  }
}

function refreshConnections() {
  global.players = {};

  if (global.socketServer.clients) {
    global.socketServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        connectPlayer(client, {})
      }
    });
  }
}

function sendGameConfigs() {
  const players = global.players;
  for (let idKey in players) {
    let player = players[idKey];
    let configuration = new Configuration(player);
    send(player.ws, JSON.stringify(configuration));
  }
}

module.exports = gameHandler;

