const infinispan = require("infinispan");
const env = require("env-var");

const log = require("../utils/log")("datagrid");
const {DATAGRID_KEYS} = require("./constants");

const DATAGRID_HOST = env.get("DATAGRID_HOST").asString();
const DATAGRID_PORT = env.get("DATAGRID_HOTROD_PORT").asIntPositive();

let {playerClient} = require("./clients");

async function initClient() {
  let client = await infinispan.client({port: DATAGRID_PORT, host: DATAGRID_HOST}, {cacheName: "players"});
  log.info(`Connected to Infinispan player data`);

  let stats = await client.stats();
  log.debug(stats);

  let listenerId = await client.addListener("create", key => handleDataChange(client,"create", key));
  client.addListener("modify", key => handleDataChange(client,"modify", key), {listenerId});
  client.addListener("remove", key => handleDataChange(client,"remove", key), {listenerId});

  return client;
}

async function handleDataChange(client, changeType, key) {
  log.debug(`Data change: ${changeType} ${key}`);
}

async function initPlayers() {
  try {
    playerClient = await initClient();
  } catch (error) {
    log.error(`Error connecting to Infinispan admin data: ${error.message}`);
    log.error(error);
  }
  return playerClient;
}

module.exports = initPlayers;
