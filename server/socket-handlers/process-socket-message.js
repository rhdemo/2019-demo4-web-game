const log = require("../utils/log")("socket-handlers");
const {INCOMING_MESSAGE_TYPES} = require("../message-types");


function processSocketMessage(ws, messageStr) {
    let messageObj = JSON.parse(messageStr);

    switch (messageObj.type) {
        case INCOMING_MESSAGE_TYPES.CONNECTION:
            connectionHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.PING:
            pingHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.MOTION:
            motionHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.MOTION_RAW:
            motionRawHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.LOAD_TEST:
            loadTestHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.TRAINING_MOTION:
            trainingMotionHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.TRAINING:
            trainingHandler(ws, messageObj);
            break;

        default:
            log.warn(`Unhandled Game Message of type "${messageStr}"`);
            break;
    }
}

/**
 * Wraps a message handler with some generic logging
 * @param {Function} fn The handler function implementation
 * @param {String} type The named type of the payload
 */
function wrapMessageHandler (type, fn) {
    return function messageHandlerWrapper (ws, messageObj) {
        log.info(`processing message of type "${type}"`);
        // log.debug(`payload for message "${type}" was: %j`, messageObj);

        fn(ws, messageObj)
    }
}

const connectionHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.CONNECTION, require("./connect-player"))
const pingHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.PING, function (ws, messageObj) {})
const motionHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.MOTION, require("./motion"));
const motionRawHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.MOTION_RAW, require("./motion-raw"));
const loadTestHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.LOAD_TEST, require("./load-test"));
const trainingMotionHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.TRAINING_MOTION, require("./training-motion"));
const trainingHandler = wrapMessageHandler(INCOMING_MESSAGE_TYPES.TRAINING, require("./training"));

module.exports = processSocketMessage;
