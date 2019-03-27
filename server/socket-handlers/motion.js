const env = require("env-var");
const axios = require("axios");
const uuidv4 = require('uuid/v4');

const log = require("../utils/log")("socket-handlers/motion");
const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
const {kafkaProducer, GESTURE_TOPIC_NAME} = require("../kafka-producer");
const GESTURE_API_URL = env.get("GESTURE_API_URL", "http://demo4-gesture:8080").asString();


function motionHandler(ws, messageObj) {
    axios({
        method: "POST",
        url: new URL("/gesture", GESTURE_API_URL).href,
        data: messageObj
    }).then(response => {
        log.debug("response from gesture API: %j", response.data);
        let feedbackMsg = {
            type: OUTGOING_MESSAGE_TYPES.MOTION_FEEDBACK,
            uuid: messageObj.uuid,
            ...response.data
        };
        ws.send(JSON.stringify(feedbackMsg));

        let kafkaKey = messageObj.uuid || uuidv4();
        let playerId = messageObj.playerId || null;
        let machineId = null;
        if (playerId) {
            let player = global.players[playerId];
            machineId = player ? player.machineId : null;
        }

        let jsonMsg = JSON.stringify({
            sensorId: playerId,
            machineId,
            vibrationClass: response.data.gesture,
            confidence: response.data.probability
        });
        let kafkaMsg = Buffer.from(jsonMsg);
        log.debug(`gestureProducer.produce topic: ${GESTURE_TOPIC_NAME}; key: ${kafkaKey}; msg: ${jsonMsg}`);
        kafkaProducer.produce(GESTURE_TOPIC_NAME, -1, kafkaMsg, kafkaKey);
    })
        .catch(error => {
            log.error("error occured in http call to s3 gesture API:");
            log.error(error);
        });
}

module.exports = motionHandler;