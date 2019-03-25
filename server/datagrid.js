const infinispan = require("infinispan");
const WebSocket = require("ws");
const env = require("env-var");
const log = require("./utils/log")("datagrid");
const {OUTGOING_MESSAGE_TYPES} = require("./message-types");

const DATAGRID_HOST = env.get("DATAGRID_HOTROD_SERVICE_HOST").asString();
const DATAGRID_PORT = env.get("DATAGRID_HOTROD_SERVICE_PORT").asIntPositive();

async function initClient() {
  let client = await infinispan.client({port: DATAGRID_PORT, host: DATAGRID_HOST});
  log.info(`Connected to Infinispan game data`);

  let stats = await client.stats();
  log.debug(stats);

  let listenerId = await client.addListener("create", key => handleDataChange(client,"create", key));
  client.addListener("modify", key => handleDataChange(client,"modify", key), {listenerId});
  client.addListener("remove", key => handleDataChange(client,"remove", key), {listenerId});

  return client;
}


async function handleDataChange(client, changeType, key) {
  log.info(`Data change: ${changeType} ${key}`);
  let value;
  // value = await client.get(key);
  // log.debug(`value = ${value}`);
  switch (key) {
    case "game":
      log.info("Game change");
      value = await client.get(key);
      log.debug(`value = ${value}`);
      global.game = JSON.parse(value);
      sendGameConfigs();
      break;
  }
}

function sendGameConfigs() {
  //TODO read player data from datagrid
  const game = global.game;
  const players = global.players;
  for (let idKey in players) {
    if (players.hasOwnProperty(idKey)) {
      let player = players[idKey];
      let configuration = {
        type: OUTGOING_MESSAGE_TYPES.CONFIGURATION,
        gameState: game.state,
        playerId: player.id,
        username: player.username,
        score: player.score,
        machineId: player.machineId
      };

      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(configuration));
      }
    }
  }
}

async function initData() {
  let dataClient = null;
  try {
    dataClient = await initClient();
    //TODO init data
  } catch (error) {
    log.error(`Error connecting to Infinispan admin data: ${error.message}`);
    log.error(error);
  }
  return dataClient;
}
module.exports.initData = initData;
