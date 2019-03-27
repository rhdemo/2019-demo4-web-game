const env = require("env-var");
const axios = require("axios");
const uuidv4 = require('uuid/v4');

const log = require("../utils/log")("socket-handlers/motion");
const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
const {kafkaProducer, TOPICS} = require("../kafka-producer");
const GESTURE_API_URL = env.get("GESTURE_API_URL", "http://demo4-gesture:8080").asString();


async function motionHandler(ws, messageObj) {
    try {
        let gestureResponse = await axios({
            method: "POST",
            url: new URL("/gesture", GESTURE_API_URL).href,
            data: messageObj
        })
        sendFeedback(ws, messageObj, gestureResponse.data)
        sendKafkaMessage(messageObj, gestureResponse.data)
    } catch (error) {
        log.error("error occured in http call to gesture API:")
        log.error(error)
    }
}

function sendFeedback(ws, socketMessage, gestureData) {
    let feedbackMsg = {
        type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
        uuid: socketMessage.uuid,
        ...gestureData
    }
    ws.send(JSON.stringify(feedbackMsg))
}

function sendKafkaMessage(socketMessage, gestureData) {
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
        vibrationClass: gestureData.gesture,
        confidence: gestureData.probability
    });

    let kafkaMsg = Buffer.from(jsonMsg);

    log.debug(`kafka produce topic: ${TOPICS.MOTION}; key: ${kafkaKey}; msg: ${jsonMsg}`);
    kafkaProducer.produce(TOPICS.MOTION, -1, kafkaMsg, kafkaKey);
}

module.exports = motionHandler;