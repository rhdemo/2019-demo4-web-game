const log = require("../utils/log")("socket-handlers/connection");
const Player = require("../models/player");
const Configuration = require("../models/configuration");
const generateUsername = require("../utils/username/generate-username");
const {playerClient} = require("../datagrid/clients");

let game = require("../data/game");
let players = require("../data/players");

async function connectPlayer(ws, messageObj) {
  let player = await initPlayer(ws, messageObj.playerId, messageObj.gameId);
  let configuration = new Configuration(player);
  ws.send(JSON.stringify(configuration));
  return player;
}

async function initPlayer(ws, playerId, gameId) {
  let player;

  //combination of playerId + gameId should be unique
  if (playerId && gameId === game.id) {
    player = await getExistingPlayer(ws, playerId)
  } else {
    let username = await generateUniqueUsername();
    player = await createNewPlayer(ws, username);
  }

  player.ws = ws;
  players[player.id] = player;
  return player;
}

async function getExistingPlayer(ws, playerId) {
  let playerStr;
  try {
    playerStr = await playerClient.get(playerId);
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
  let playerStr = JSON.stringify(player);

  try {
    await playerClient.put(player.id, playerStr);
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
    try {
      let playerStr = await playerClient.get(username);
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
