const uuidv4 = require('uuid/v4')

const log = require("../utils/log")("socket-handlers/motion")
const {kafkaProducer, TOPICS} = require("../kafka-producer")

function loadTestHandler(ws, messageObj) {
  let kafkaKey = messageObj.playerId || messageObj.uuid || uuidv4()
    let jsonMsg = JSON.stringify(messageObj);
    let kafkaMsg = Buffer.from(jsonMsg)
    log.debug(`kafka  produce topic: ${TOPICS.LOAD_TEST}; key: ${kafkaKey}; msg: ${jsonMsg}`)
    kafkaProducer.produce(TOPICS.LOAD_TEST, -1, kafkaMsg, kafkaKey)
}

module.exports = loadTestHandler
