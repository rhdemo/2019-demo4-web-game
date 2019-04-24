const {DATAGRID_KEYS} = require("./constants");
const log = require("../utils/log")("datagrid/leaderboard");

async function readLeaderboard() {
  log.debug("reading leaderboard");
  try {
    let str = await global.leaderboardClient.get(DATAGRID_KEYS.LEADERBOARD);
    if (str) {
      global.leaderboard = JSON.parse(str);
    } else {
      global.leaderboard = undefined;
    }
    return global.leaderboard;
  } catch (error) {
    log.error("Failed to read leaderboard. Error:", error.message);
  }
}


module.exports = readLeaderboard;
