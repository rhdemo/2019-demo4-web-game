const uuidv4 = require('uuid/v4')

const log = require("../utils/log")("socket-handlers/motion")
const {kafkaProducer, LOAD_TEST_TOPIC_NAME} = require("../kafka-producer")

function loadTestHandler(ws, messageObj) {
    let kafkaKey = messageObj.uuid || uuidv4()
    let jsonMsg = JSON.stringify(messageObj);
    let kafkaMsg = Buffer.from(jsonMsg)
    log.debug(`ka.produce topic: ${LOAD_TEST_TOPIC_NAME}; key: ${kafkaKey}; msg: ${jsonMsg}`)
    kafkaProducer.produce(LOAD_TEST_TOPIC_NAME, -1, kafkaMsg, kafkaKey)
}

module.exports = loadTestHandler