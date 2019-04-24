const log = require("../utils/log")("datagrid/poll-datagrid");
const initData = require("./init-data");
const initPlayers = require("./init-players");
const readMachines = require("./read-machines");
const {DATAGRID_KEYS} = require("./constants");


function pollDatagrid(interval) {
  setTimeout(async () => {
    log.debug("checking Datagrid connections");
    await checkDataClient();
    await checkPlayerClient();
    await readMachines(true);
    pollDatagrid(interval);
  }, interval);
}

async function checkDataClient() {
  log.debug("checkDataClient");
  try {
    let str = await global.dataClient.get(DATAGRID_KEYS.GAME);
    if (str) {
      global.game = JSON.parse(str);
    } else {
      log.error("Game configuration missing");
    }
  } catch (e) {
    log.error("Error connecting to Infinispan default cache", e.message);
    await reconnectDataClient();
  }
}

async function reconnectDataClient() {
  log.info("Attempting to reconnect to Infinispan default cache");
  try {
    await initData();
  } catch (e) {
    log.error("Failed to reconnect to Infinispan default cache.  Error: ", e.message);
  }
}

async function checkPlayerClient() {
  log.debug("checkPlayerClient");
  try {
    const str = await global.playerClient.get(DATAGRID_KEYS.LEADERBOARD);
    if (str) {
      global.leaderboard = JSON.parse(str);
    } else {
      log.error("Leaderboard missing");
    }
  } catch (e) {
    log.error("Error connecting to Infinispan players cache", e.message);
    await reconnectPlayerClient();
  }
}

async function reconnectPlayerClient() {
  log.info("Attempting to reconnect to Infinispan players cache");
  try {
    await initPlayers();
  } catch (e) {
    log.error("Failed to reconnect to Infinispan players cache.  Error: ", e.message);
  }
}


module.exports = pollDatagrid;
