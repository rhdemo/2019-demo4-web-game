const WebSocket = require("ws");
const log = require("../utils/log")("datagrid/game");
const Configuration = require("../models/configuration")
const readGame = require("./read-game");

async function gameHandler(client, changeType, key) {
    log.info("Game change");
    await readGame();
    sendGameConfigs();
}


function sendGameConfigs() {
    const players = global.players;
    for (let idKey in players) {
        if (players.hasOwnProperty(idKey)) {
            let player = players[idKey];
            let configuration = new Configuration(player);
            if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify(configuration));
            }
        }
    }
}

module.exports = gameHandler;

