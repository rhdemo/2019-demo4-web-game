const infinispan = require("infinispan");
const env = require("env-var");

const log = require("../utils/log")("datagrid");
const readLeaderboard = require("./read-leaderboard");
const {DATAGRID_KEYS} = require("./constants");

const DATAGRID_HOST = env.get("DATAGRID_HOST").asString();
const DATAGRID_HOTROD_PORT = env.get("DATAGRID_HOTROD_PORT").asIntPositive();

async function initClient() {
  let client = await infinispan.client({port: DATAGRID_HOTROD_PORT, host: DATAGRID_HOST}, {cacheName: "leaderboard"});
  log.info(`Connected to Infinispan leaderboard data`);

  let stats = await client.stats();
  log.debug(stats);

  let listenerId = await client.addListener("create", key => handleDataChange(client,"create", key));
  client.addListener("modify", key => handleDataChange(client,"modify", key), {listenerId});
  client.addListener("remove", key => handleDataChange(client,"remove", key), {listenerId});

  return client;
}

async function handleDataChange(client, changeType, key) {
  log.debug(`Data change: ${changeType} ${key}`);
  if (key === DATAGRID_KEYS.LEADERBOARD) {
    readLeaderboard();
  }
}

async function initLeaderboard() {
  try {
    global.leaderboardClient = await initClient();
    await readLeaderboard();
  } catch (error) {
    log.error(`Error connecting to Infinispan leaderboard data: ${error.message}`);
    log.error(error);
  }
  return global.leaderboardClient;
}

module.exports = initLeaderboard;
