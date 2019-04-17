const uuidv4 = require("uuid/v4")

const log = require("../utils/log")("socket-handlers/motion")
const {kafkaProducer, TOPICS} = require("../kafka-producer")

let game = require("../data/game");

function motionRawHandler(ws, messageObj) {
    log.debug("motionRawHandler");
    log.debug(messageObj);

    if (!game || !game.shakeDemo || !game.shakeDemo.enabled) {
        log.info("Shake Demo not enabled. Ignoring motion-raw");
        return;
    }

    if (!messageObj.motion) {
        log.error("failed to process motion-raw data", messageObj);
        return;
    }

    const sumAbs = x => x.reduce((acc, value) => acc + Math.abs(value), 0);
    const sumVectors = vectors => sumAbs(vectors.map(v => sumAbs(v)));

    const totalAcceleration = sumVectors(messageObj.motion);
    const multiplier = game.shakeDemo.multiplier || 5;
    const maxMessages = Math.floor((game.shakeDemo.maxPerSecond || 1000) / 4)
    let numMessages = Math.floor(totalAcceleration * multiplier);
    numMessages = Math.min(numMessages, maxMessages);

    const kafkaMsg = Buffer.from(JSON.stringify({type: "motion-raw"}))

    log.info(`sending ${numMessages} to kafka topic: ${TOPICS.MOTION_RAW}`)
    for (let i=0; i<numMessages; i++) {
        if (kafkaProducer.isConnected()) {
            kafkaProducer.produce(TOPICS.MOTION_RAW, -1, kafkaMsg, uuidv4())
        } else {
            log.error("kafka producer is not connected. not sending motion-raw payload")
        }
    }
}

module.exports = motionRawHandler;
