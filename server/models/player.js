const NUM_MACHINES = 10;

class Player {
  constructor(id) {
    this.id = id;
    this.username = this.id;
    this.gameId = global.game.id;
    this.score = 0;
    this.machineId = Math.floor(Math.random() * Math.floor(NUM_MACHINES));
  }
}

module.exports = Player;
