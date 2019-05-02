const env = require("env-var");
const request = require("../utils/request");
const _ = require('lodash');

const log = require("../utils/log")("socket-handlers/motion");
const send = require("../utils/send");
const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
const PREDICTION_HOST_HEADER = env.get("PREDICTION_HOST_HEADER", "tf-serving-knative-demo.tf-demo.example.com").asString();
const PREDICTION_URL = env.get("PREDICTION_URL").asString();

async function trainingMotionHandler(ws, messageObj) {
  log.debug("trainingMotionHandler", messageObj);

  let {uuid, gesture, playerId, motion, orientation} = messageObj;

  if (!messageObj.gesture) {
    log.warn(`Ignoring incoming malformed motion data. Missing gesture.`);
    return;
  }

  let prediction;
  let probability;
  let correct;

    try {
      let gestureResponse = await request({
        headers: {
          "Host": PREDICTION_HOST_HEADER,
          "content-type": "application/json",
        },
        method: "POST",
        url: PREDICTION_URL,
        data: {
          instances: [
            {
              gesture,
              motion,
              orientation
            }
          ]
        }
      });

      prediction = gestureResponse.data.payload[0];
      let results = getResults(gesture, prediction);
      correct = results.correct;
      probability = results.probability;

    } catch (error) {
      log.error("error occurred in http call to prediction API:");
      log.error(error.message);

      //If we fail to reach the AI service, show the message
      prediction = {error: error.message};
      probability = 1
      correct = true;
    }

  return sendFeedback(ws, {uuid, playerId, gesture, correct, probability, prediction});
}

function getResults(gesture, prediction) {
  let minProbability;
  if (gesture === "draw-circle") {
    minProbability = _.get(global, "game.ai.circle");
  } else {
    minProbability = _.get(global, `game.ai.${gesture}`);
  }

  const probability = prediction.predictions[gesture];
  let correct;

  if (!minProbability) {
    correct = gesture === prediction.candidate;
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

  let feedbackMsg = {
    type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
    uuid,
    gesture,
    correct,
    probability,
    score,
    totalScore: 0,
    prediction
  };

  send(ws, JSON.stringify(feedbackMsg));
}

module.exports = trainingMotionHandler;
