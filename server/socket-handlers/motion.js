const env = require("env-var");
const axios = require("axios");
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

const log = require("../utils/log")("socket-handlers/motion");
const GAME_STATES = require("../models/game-states");
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

  let gesture = messageObj.gesture || "unspecified";

  if (global.game.bypassAI) {
    log.info("AI Bypass enabled");
    sendFeedback(ws, messageObj, gesture, true, 1, {});
    sendVibration(messageObj, gesture, 1);
    return;
  }

  try {
    let gestureResponse = await axios({
      headers: {
        "Host": PREDICTION_HOST_HEADER,
        "content-type": "application/json" ,
      },
      method: "POST",
      url: PREDICTION_URL,
      data: {
        instances: [
          {
            gesture: AI_MOTIONS[messageObj.gesture],
            motion : messageObj.motion,
            orientation: messageObj.orientation
          }
        ]
      }
    });

    let prediction = gestureResponse.data.payload[0];
    let probability = prediction.candidate_score;
    let correct = AI_MOTIONS[gesture] === prediction.candidate;

    if (correct) {
      sendVibration(messageObj, gesture, probability);
    }

    return sendFeedback(ws, messageObj, gesture, correct, probability, prediction);
  } catch (error) {
    log.error("error occured in http call to prediction API:");
    log.error(error.message);

    //If we fail to reach the AI service, just give them credit.
    sendVibration(messageObj, gesture, 1);
    return sendFeedback(ws, messageObj, gesture, true, 1, {error: error.message});
  }
}

async function sendFeedback(ws, socketMessage, gesture, correct, probability, prediction) {
  let score = 0;
  if (correct) {
    score = _.get(global, `game.scoring.${gesture}`);
  }

  let totalScore = await updatePlayerScore(socketMessage, score);

  let feedbackMsg = {
    type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
    uuid: socketMessage.uuid,
    gesture,
    correct,
    probability,
    score,
    totalScore,
    prediction
  };
  ws.send(JSON.stringify(feedbackMsg));
}

async function updatePlayerScore(socketMessage, score) {
  let {playerId} = socketMessage;

  if (!playerId) {
    return score;
  }

  let playerStr = await global.dataClient.get(playerId);

  if (!playerStr) {
    return score;
  }

  let player = JSON.parse(playerStr);
  player.score += score;
  global.dataClient.put(playerId, JSON.stringify(player));

  return player.score;
}

function sendVibration(socketMessage, vibrationClass, confidencePercentage) {
  let kafkaKey = socketMessage.uuid || uuidv4();
  let playerId = socketMessage.playerId || null;
  let machineId = null;

  if (playerId) {
    let player = global.players[playerId];
    machineId = player ? player.machineId : null;
  }

  let jsonMsg = JSON.stringify({
    sensorId: playerId,
    machineId,
    vibrationClass,
    confidencePercentage
  });

  let kafkaMsg = Buffer.from(jsonMsg);

  log.debug(`kafka produce topic: ${TOPICS.MOTION}; key: ${kafkaKey}; msg: ${jsonMsg}`);

  if (kafkaProducer.isConnected()) {
    kafkaProducer.produce(TOPICS.MOTION, -1, kafkaMsg, kafkaKey);
  } else {
    log.error("kafka producer is not connected. not sending vibration payload");
  }
}

module.exports = motionHandler;
