const env = require("env-var");
const axios = require("axios");
const lodashGet = require('lodash/get');

const log = require("../utils/log")("socket-handlers/motion");
const GAME_STATES = require("../models/game-states");
const {DATAGRID_KEYS, LEADERBOARD_MAX} = require("../datagrid/constants");
const readLeaderboard = require("../datagrid/read-leaderboard");
const send = require("../utils/send");
const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
const {kafkaProducer, TOPICS} = require("../kafka-producer");
const PREDICTION_HOST_HEADER = env.get("PREDICTION_HOST_HEADER", "tf-serving-knative-demo.tf-demo.example.com").asString();
const PREDICTION_URL = env.get("PREDICTION_URL").asString();

const AI_MOTIONS = {
  shake: "shake",
  circle: "draw-circle",
  x: "draw-cross",
  roll: "roll",
  fever: "fever",
  floss: "floss",
};

async function motionHandler(ws, messageObj) {
  if (global.game.state !== GAME_STATES.ACTIVE) {
    log.warn(`Ignoring incoming motion because the game is in state ${global.game.state}`);
    return;
  }

  let {uuid, gesture, playerId, motion, orientation} = messageObj;

  if (!messageObj.playerId) {
    log.warn(`Ignoring incoming malformed motion data. Missing playerId.`);
    return;
  }

  if (!messageObj.gesture) {
    log.warn(`Ignoring incoming malformed motion data. Missing gesture.`);
    return;
  }

  let prediction;
  let probability;
  let correct;

  if (global.game.bypassAI) {
    log.info("AI Bypass enabled");

    prediction = {};
    probability = 1
    correct = true;
  } else {
    try {
      const startTime = new Date();
      const gestureResponse = await axios({
        timeout: 5000,
        headers: {
          "Host": PREDICTION_HOST_HEADER,
          "content-type": "application/json",
        },
        method: "POST",
        url: PREDICTION_URL,
        data: {
          instances: [
            {
              gesture: AI_MOTIONS[gesture] || gesture,
              motion,
              orientation
            }
          ]
        }
      });

      const endTime = new Date();
      const timeDiff = (endTime - startTime) / 1000;

      if (timeDiff > 1) {
        log.warn(`Prediction took ${timeDiff.toFixed(1)} seconds`);
      }

      prediction = gestureResponse.data.payload[0];
      let results = getResults(gesture, prediction);
      correct = results.correct;
      probability = results.probability;

    } catch (error) {
      log.error("error occurred in http call to prediction API:");
      log.error(error.message);

      //If we fail to reach the AI service, just give them credit.
      prediction = {error: error.message};
      probability = 1
      correct = true;
    }
  }

  // in the case of a long request to prediction, we don't want to have a score count after we've stopped
  if (global.game.state !== GAME_STATES.ACTIVE) {
    log.warn(`Ignoring predicted motion because the game is in state ${global.game.state}`);
    return;
  }


  let player = await getPlayer(playerId);

  if (!player) {
    return
  }

  const score = calculateScore(correct, gesture);
  const bonus = calculateBonus(correct, gesture, player);

  player = await updatePlayer({ws, player, gesture, correct, score, bonus});

  if (correct) {
    sendVibration({uuid, player, gesture, probability});
  }

  sendFeedback({ws, uuid, player, score, bonus, gesture, correct, probability, prediction});
}

function getResults(gesture, prediction) {
  const aiMotion = AI_MOTIONS[gesture];
  const minProbability = lodashGet(global, `game.ai.${gesture}`);
  const probability = prediction.predictions[aiMotion];
  let correct;

  if (!minProbability) {
    correct = aiMotion === prediction.candidate;
    return {correct, probability}
  }

  correct = probability > minProbability;
  return {correct, probability};
}

async function getPlayer(id) {
  let player = null;

  try {
    let playerStr = await global.playerClient.get(id);

    if (playerStr) {
      player = JSON.parse(playerStr);
    } else {
      log.error(`Player ${id} data not found`);
      return null;
    }
  } catch (error) {
    log.error("error occurred getting player data:", error.message);
  }

  return player;
}

function calculateScore(correct, gesture) {
  if (!correct) {
    return 0;
  }
  return lodashGet(global, `game.scoring.${gesture}`, 0);
}

function calculateBonus(correct, gesture, player) {
  if (!correct) {
    return 0;
  }

  for (let key in player.successfulMotions) {
    if (key === gesture && player.successfulMotions[key]) {
      //already have the move, no bonus
      return 0;
    } else if (key !== gesture && !player.successfulMotions[key]) {
      //still missing a move, no bonus
      return 0;
    }
  }

  return lodashGet(global, "game.scoring.bonus", 1000);
}

async function updatePlayer({ws, player, gesture, correct, score, bonus}) {
  try {
    updatePlayerFields({player, correct, gesture, score, bonus})
    await global.playerClient.put(player.id, JSON.stringify(player));
    await updateLeaderboard(player);
    global.players[player.id] = {...player, ws};
  } catch (error) {
    log.error("error occurred updating player data:", error.message);
  }

  return player;
}

function updatePlayerFields({player, gesture, correct, score, bonus}) {
  player.score += score;
  player.score += bonus;
  let motionRecord = correct? player.successfulMotions : player.failedMotions
  let numMotions = motionRecord[gesture] || 0;
  motionRecord[gesture] = numMotions + 1;

  return player;
}

async function updateLeaderboard(player) {
  if (!global.leaderboard || !global.leaderboard.players) {
    global.leaderboard = {
      players: []
    }
  }

  const length = global.leaderboard.players.length;

  if (length < LEADERBOARD_MAX || player.score >= global.leaderboard.players[length - 1].score) {
    await readLeaderboard();
    let newLeaders = global.leaderboard.players.filter(leader => leader.id !== player.id);
    newLeaders.push(player)
    newLeaders = newLeaders.sort(sortPlayers);
    global.leaderboard.players  = newLeaders.slice(0,10);
    try {
      await global.leaderboardClient.put(DATAGRID_KEYS.LEADERBOARD, JSON.stringify(global.leaderboard));
    } catch (error) {
      log.error("error occurred updating leaderboard.  Error:", error.message);
    }
    return global.leaderboard;
  }
}

function sortPlayers(p1, p2)  {
  let comp = p2.score - p1.score;
  if (comp !== 0) {
    return comp;
  }

  return p1.username.localeCompare(p2.username);
}

function sendFeedback({ws, uuid, player, score, bonus, gesture, correct, probability, prediction}) {
  let feedbackMsg = {
    type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
    uuid,
    gesture,
    correct,
    probability,
    score,
    bonus,
    totalScore: player.score,
    prediction
  };

  send(ws, JSON.stringify(feedbackMsg));
}

function sendVibration({uuid, player, gesture, probability}) {
  let jsonMsg = JSON.stringify({
    sensorId: player.id,
    machineId: player.machineId,
    vibrationClass: gesture,
    confidencePercentage: probability
  });

  let kafkaMsg = Buffer.from(jsonMsg);

  log.debug(`kafka produce topic: ${TOPICS.MOTION}; key: null; msg: ${jsonMsg}`);

  try {
    let result = kafkaProducer.produce(TOPICS.MOTION, -1, kafkaMsg, null);
    log.debug("kafka producer sent vibration payload", result, jsonMsg);
  } catch (error) {
    log.error("kafka producer failed to send vibration payload.  Error: ", error.message);
  }
}

module.exports = motionHandler;
