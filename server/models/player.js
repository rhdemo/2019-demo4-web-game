const uuidv4 = require('uuid/v4');
const {DATAGRID_KEY_PREFIXES} = require("../datagrid");
const {generateUserName} = require("../utils/username");
const NUM_MACHINES = 10;

class Player {
  constructor(id) {
    this.id = id || DATAGRID_KEY_PREFIXES.PLAYER + uuidv4();
    this.username = generateUserName();
    this.score = 0;
    this.machineId = Math.floor(Math.random() * Math.floor(NUM_MACHINES));
  }
}

module.exports = Player;