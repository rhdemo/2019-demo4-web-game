const env = require("env-var");
const axios = require("axios");
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

const log = require("../utils/log")("socket-handlers/motion");
const GAME_STATES = require("../models/game-states");
const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
const {kafkaProducer, TOPICS} = require("../kafka-producer");
const PREDICTION_URL = env.get("PREDICTION_URL").asString();

async function motionHandler(ws, messageObj) {
  if (global.game.state !== GAME_STATES.ACTIVE) {
    log.warn(`Ignoring incoming motion because the game is in state ${global.game.state}`);
    return;
  }

  try {
    let gestureResponse = await axios({
      method: "POST",
      url: PREDICTION_URL,
      data: messageObj
    });

    let gesture = messageObj.gesture || "unspecified";
    let probability = gestureResponse.data[gesture] || 0;
    let correct = isCorrect(gesture, probability);

    sendFeedback(ws, messageObj, gesture, correct, probability, gestureResponse.data);

    if (correct) {
      sendVibration(messageObj, gesture, probability);
    }
  } catch (error) {
    log.error("error occured in http call to prediction API:");
    log.error(error);
  }
}

function isCorrect(attempted, probability) {
  if (!attempted || !probability) {
    return false;
  }
  const minProbability = _.get(global, `ai.minProbability.${attempted}`) || 0.8;
  return probability > minProbability;
}

function sendFeedback(ws, socketMessage, gesture, correct, probability, prediction) {
  let score = 0;
  if (correct) {
    score = _.get(global, `game.scoring.${gesture}`);
  }

  let feedbackMsg = {
    type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
    uuid: socketMessage.uuid,
    gesture,
    correct,
    probability,
    score,
    prediction
  };
  ws.send(JSON.stringify(feedbackMsg));
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
