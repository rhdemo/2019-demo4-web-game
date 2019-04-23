const env = require("env-var");
const axios = require("axios");
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

const log = require("../utils/log")("socket-handlers/motion");
const GAME_STATES = require("../models/game-states");
const {DATAGRID_KEYS, LEADERBOARD_MAX} = require("../datagrid/constants");
const readLeaderboard = require("../datagrid/read-leaderboard");
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

  if (correct) {
    sendVibration({uuid, playerId, gesture, probability});
  }

  return sendFeedback(ws, {uuid, playerId, gesture, correct, probability, prediction});
}

function getResults(gesture, prediction) {
  const aiMotion = AI_MOTIONS[gesture];
  const minProbability = _.get(global, `game.ai.${gesture}`);
  const probability = prediction.predictions[aiMotion];
  let correct;

  if (!minProbability) {
    correct = aiMotion === prediction.candidate;
    return {correct, probability}
  }

  correct = probability > minProbability;
  return {correct, probability};
}

async function sendFeedback(ws, msgParamsObj) {
  let {uuid, gesture, correct, probability, prediction} = msgParamsObj;
  let score = 0;
  if (correct) {
    score = _.get(global, `game.scoring.${gesture}`);
  }

  let player = await updatePlayer({...msgParamsObj, score});
  if (!player) {
    return
  }

  const totalScore = player ? player.score : undefined;

  let feedbackMsg = {
    type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
    uuid,
    gesture,
    correct,
    probability,
    score,
    totalScore,
    prediction
  };

  ws.send(JSON.stringify(feedbackMsg));
}

async function updatePlayer(msgParamsObj) {
  let {playerId} = msgParamsObj;
  let player = null;

  try {
    let playerStr = await global.playerClient.get(playerId);

    if (playerStr) {
      player = JSON.parse(playerStr);
    } else {
      log.error(`Player ${playerId} data not found`);
      return null;
    }

    updatePlayerFields(player, msgParamsObj)
    await global.playerClient.put(playerId, JSON.stringify(player));
    await updateLeaderboard(player);
  } catch (error) {
    log.error("error occurred updating player data:", error.message);
  }

  return player;
}

function updatePlayerFields(player, msgParamsObj) {
  let {gesture, correct, score} = msgParamsObj;
  player.score += score;
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
    return global.playerClient.put(DATAGRID_KEYS.LEADERBOARD, JSON.stringify(global.leaderboard));
  }
}

function sortPlayers(p1, p2)  {
  let comp = p2.score - p1.score;
  if (comp !== 0) {
    return comp;
  }

  return p1.username.localeCompare(p2.username);
}

function sendVibration(messageFields) {
  let {uuid, playerId, gesture, probability} = messageFields;
  let kafkaKey = playerId || uuid || uuidv4();
  let machineId = null;

  if (playerId) {
    let player = global.players[playerId];
    machineId = player ? player.machineId : null;
  }

  let jsonMsg = JSON.stringify({
    sensorId: playerId,
    machineId,
    vibrationClass: gesture,
    confidencePercentage: probability
  });

  let kafkaMsg = Buffer.from(jsonMsg);

  log.debug(`kafka produce topic: ${TOPICS.MOTION}; key: ${kafkaKey}; msg: ${jsonMsg}`);

  try {
    let result = kafkaProducer.produce(TOPICS.MOTION, -1, kafkaMsg, kafkaKey);
    log.debug("kafka producer sent vibration payload", result, kafkaKey, jsonMsg);
  } catch {
    log.error("kafka producer failed to send vibration payload");
  }
}

module.exports = motionHandler;
