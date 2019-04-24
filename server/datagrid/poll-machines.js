const log = require("../utils/log")("datagrid/poll-machines");
const GAME_STATES = require("../models/game-states");
const readMachines = require("./read-machines");

function pollMachines(interval) {
  setTimeout(async () => {
    const activeGameState = (global.game.state === GAME_STATES.ACTIVE || global.game.state === GAME_STATES.PAUSED);

    if (activeGameState) {
      await readMachines(false);
    }

    pollMachines(interval);
  }, interval);
}

module.exports = pollMachines;
