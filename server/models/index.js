const uuidv4 = require('uuid/v4');
const generateUserName = require("../utils/username").generateUserName;
const NUM_MACHINES = 10;

class Player {
  constructor(ws, id) {
    this.id = id || uuidv4();
    this.username = generateUserName();
    this.score = 0;
    this.machineId = Math.floor(Math.random() * Math.floor(NUM_MACHINES));
    this.ws = ws; //keep track of player"s ws to send him his updates.
    this.motions = [];
  }
}

module.exports.NUM_MACHINES = NUM_MACHINES;
module.exports.Player = Player;