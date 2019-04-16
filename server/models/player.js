const NUM_MACHINES = 10;

class Player {
  constructor(id) {
    this.id = id;
    this.username = this.id;
    this.gameId = global.game.id;
    this.score = 0;
    this.machineId = Math.floor(Math.random() * Math.floor(NUM_MACHINES));
    this.successfulMotions = {
      shake: 0,
      circle: 0,
      x: 0,
      roll: 0,
      fever: 0,
      floss: 0,
    };
    this.failedMotions = {
      shake: 0,
      circle: 0,
      x: 0,
      roll: 0,
      fever: 0,
      floss: 0,
    };
  }
}

module.exports = Player;
