const infinispan = require("infinispan");
const env = require("env-var");

const log = require("../utils/log")("datagrid");
const {DATAGRID_KEYS} = require("./constants");
const readGame = require("./read-game");
const gameHandler = require("./game");

const DATAGRID_HOST = env.get("DATAGRID_HOST").asString();
const DATAGRID_PORT = env.get("DATAGRID_HOTROD_PORT").asIntPositive();

async function initClient() {
  let client = await infinispan.client({port: DATAGRID_PORT, host: DATAGRID_HOST});
  log.info(`Connected to Infinispan game data`);

  let stats = await client.stats();
  log.debug(stats);

  let listenerId = await client.addListener("create", key => handleDataChange(client, "create", key));
  client.addListener("modify", key => handleDataChange(client, "modify", key), {listenerId});
  client.addListener("remove", key => handleDataChange(client, "remove", key), {listenerId});

  return client;
}

async function handleDataChange(client, changeType, key) {
  log.debug(`Data change: ${changeType} ${key}`);
  switch (key) {
    case DATAGRID_KEYS.GAME:
      gameHandler(client, changeType, key);
      break;
  }
}

async function initData() {
  try {
    global.dataClient = await initClient();
    await readGame();
  } catch (error) {
    log.error(`Error connecting to Infinispan admin data: ${error.message}`);
    log.error(error);
  }
  return global.dataClient;
}

module.exports = initData;
