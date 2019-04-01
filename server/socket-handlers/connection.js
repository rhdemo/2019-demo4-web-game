const log = require("../utils/log")("socket-handlers/connection");
const Player = require("../models/player");
const Configuration = require("../models/configuration");

async function connectionHandler(ws, messageObj) {
    log.debug("connectionHandler", messageObj);
    let player = await initPlayer(ws, messageObj.playerId);
    let configuration = new Configuration(player);
    log.debug(configuration);
    ws.send(JSON.stringify(configuration));
}

async function initPlayer(ws, playerId) {
    log.debug("initPlayer", playerId);
    let playerStr = playerId ? await global.dataClient.get(playerId) : null;
    let player;

    log.debug("playerStr", playerStr);
    if (!playerStr) {
        let newPlayer = new Player();
        await global.dataClient.put(newPlayer.id, JSON.stringify(newPlayer));
        playerStr = await global.dataClient.get(newPlayer.id);
    }

    player = JSON.parse(playerStr);
    player.ws = ws;

    global.players[player.id] = player;

    return player;
}
module.exports = connectionHandler;