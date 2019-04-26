const log = require("../utils/log")("socket-handlers/connection");
const send = require("../utils/send");
const Player = require("../models/player");
const Configuration = require("../models/configuration");
const generateUsername = require("../utils/username/generate-username");

async function connectPlayer(ws, messageObj) {
  log.debug("connectionHandler", messageObj);
  let player = await initPlayer(ws, messageObj.playerId, messageObj.gameId);
  let configuration = new Configuration(player);
  log.debug(configuration);
  send(ws, JSON.stringify(configuration));
  return player;
}

async function initPlayer(ws, playerId, gameId) {
  log.debug("initPlayer", playerId, gameId);
  let player;

  //combination of playerId + gameId should be unique
  if (playerId && gameId === global.game.id) {
    player = await getExistingPlayer(ws, playerId)
  } else {
    let username = await generateUniqueUsername();
    player = await createNewPlayer(ws, username);
  }

  player.ws = ws;
  global.players[player.id] = player;
  return player;
}

async function getExistingPlayer(ws, playerId) {
  let playerStr;
  try {
    playerStr = await global.playerClient.get(playerId);
  } catch (error) {
    log.error(`error occurred retrieving existing player ${playerId}.  Error:`, error.message);
  }

  if (!playerStr) {
    return createNewPlayer(ws, playerId);
  }

  return JSON.parse(playerStr);
}

async function createNewPlayer(ws, playerId) {
  let player = new Player(playerId);
  log.debug("createNewPlayer", playerId, player);
  let playerStr = JSON.stringify(player);

  try {
    await global.playerClient.put(player.id, playerStr);
  } catch (error) {
    log.error("error occurred saving new player data: ", error.message);
  }

  return player;
}

async function generateUniqueUsername() {
  let i = 0;
  let username = null;
  while (i < 100) {
    username = generateUsername();
    console.log("username", username);
    try {
      let playerStr = await global.playerClient.get(username);
      if (!playerStr) {
        return username;
      }
    } catch (error) {
      log.error("error occurred retrieving player data: ", error.message);
    } finally {
      i++;
    }
  }

  username += " " + Math.random().toString(36).substring(2);
  return username;
}

module.exports = connectPlayer;
