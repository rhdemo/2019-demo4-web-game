const WebSocket = require("ws");
const log = require("../utils/log")("datagrid/game");
const Configuration = require("../models/configuration");
const GAME_STATES = require("../models/game-states");
const readGame = require("./read-game");
const connectPlayer = require("../socket-handlers/connect-player");

let game = require("../data/game");
let players = require("../data/players");

async function gameHandler(client, changeType, key) {
  log.info("Game change");

  const originalId = game ? game.id : null;
  await readGame();

  if (originalId !== game.id) {
    refreshConnections();
  } else {
    sendGameConfigs();
  }
}

function refreshConnections() {
  for (let idKey in players) {
    let player = players[idKey];
    if (player.ws.readyState === WebSocket.OPEN) {
      connectPlayer(player.ws, {})
    } else {
      delete players[idKey];
    }
  }
}

function sendGameConfigs() {
  for (let idKey in players) {
    let player = players[idKey];
    let configuration = new Configuration(player);
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(configuration));
    }
  }
}

module.exports = gameHandler;

