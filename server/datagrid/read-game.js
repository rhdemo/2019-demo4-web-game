const log = require("../utils/log")("datagrid/read-game");

async function readGame() {
    let gameStr = await global.dataClient.get("game");
    log.debug("initializing game", gameStr);
    if (gameStr) {
        global.game = JSON.parse(gameStr);
    }
    return global.game;
}


module.exports = readGame;

