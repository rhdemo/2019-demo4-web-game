const {DATAGRID_KEYS} = require("./constants");
const log = require("../utils/log")("datagrid/leaderboard");
const {dataClient} = require("./clients");
let leaderboard = require("../data/leaderboard");

async function readLeaderboard() {
  log.debug("reading leaderboard");
  try {
    let str = await dataClient.get(DATAGRID_KEYS.LEADERBOARD);
    if (str) {
      leaderboard = JSON.parse(str);
    } else {
      leaderboard = undefined;
    }
    return leaderboard;
  } catch (error) {
    log.error("Failed to read leaderboard. Error:", error.message);
  }
}


module.exports = readLeaderboard;
