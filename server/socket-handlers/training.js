const env = require("env-var");
const request = require("../utils/request");

const log = require("../utils/log")("socket-handlers/motion");
const TRAINING_URL = env.get("TRAINING_URL", "http://demo4-gesture:8080/training").asString();


async function trainingHandler(ws, messageObj) {
  try {
    await request({
      method: "POST",
      url: TRAINING_URL,
      data: messageObj
    });
  } catch (error) {
    log.error("error occurred in http call to gesture API:", error.message);
  }
}

module.exports = trainingHandler;
