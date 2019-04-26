const {OUTGOING_MESSAGE_TYPES} = require("../message-types");

class Configuration {
  constructor(player) {
    this.type = OUTGOING_MESSAGE_TYPES.CONFIGURATION;
    this.gameState = global.game.state;
    this.gameMotions = global.game.motions;
    this.playerId = player.id;
    this.gameId = player.gameId;
    this.username = player.username;
    this.score = player.score;
    this.machineId = player.machineId;
    this.successfulMotions = player.successfulMotions;
  }
}

module.exports = Configuration;
