const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
let game = require("../data/game");

class Configuration {
  constructor(player) {
    this.type = OUTGOING_MESSAGE_TYPES.CONFIGURATION;
    this.gameState = game.state;
    this.gameMotions = game.motions;
    this.playerId = player.id;
    this.gameId = player.gameId;
    this.username = player.username;
    this.score = player.score;
    this.machineId = player.machineId;
  }
}

module.exports = Configuration;
