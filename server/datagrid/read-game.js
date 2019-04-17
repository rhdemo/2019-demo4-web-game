const log = require("../utils/log")("datagrid/read-game");
const {DATAGRID_KEYS} = require("./constants");
const {dataClient} = require("./clients");
let game = require("../data/game");

async function readGame() {
  try {
    let str = await dataClient.get(DATAGRID_KEYS.GAME);
    if (str) {
      game = JSON.parse(str);
    } else {
      log.error("Game configuration missing");
    }
  } catch (error) {
    log.error("Failed to read game. Error:", error.message);
  }
}

module.exports = readGame;

