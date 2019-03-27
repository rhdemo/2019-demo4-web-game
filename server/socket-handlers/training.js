const env = require("env-var");
const axios = require("axios");

const log = require("../utils/log")("socket-handlers/motion");
const GESTURE_API_URL = env.get("GESTURE_API_URL", "http://demo4-gesture:8080").asString();


async function trainingHandler(ws, messageObj) {
    try {
        await axios({
            method: "POST",
            url: new URL("/training", GESTURE_API_URL).href,
            data: messageObj
        })
    } catch (error) {
        log.error("error occured in http call to gesture API:")
        log.error(error)
    }
}

module.exports = trainingHandler;