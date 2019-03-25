const axios = require("axios");
const uuidv4 = require('uuid/v4');
const env = require("env-var");
const log = require("./utils/log")("socket-handlers");

const {INCOMING_MESSAGE_TYPES} = require("./message-types");
const {Player} = require("./models");
const {gestureProducer, GESTURE_TOPIC_NAME} = require("./gestureProducer");

const GESTURE_API_URL = env.get("GESTURE_API_URL", "http://demo4-gesture:8080");

function processSocketMessage(ws, messageStr) {
    let messageObj = JSON.parse(messageStr);

    switch (messageObj.type) {
        case INCOMING_MESSAGE_TYPES.CONNECTION:
            connectionHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.MOTION:
            motionHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.PING:
            pingHandler(ws, messageObj);
            break;

        case INCOMING_MESSAGE_TYPES.SCORE:
            scoreHandler(ws, messageObj);
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
        log.debug(`payload for message "${type}" was: %j`, messageObj);

        fn(ws, messageObj)
    }
}

const connectionHandler = wrapMessageHandler(
    INCOMING_MESSAGE_TYPES.CONNECTION,
    function connectionHandler(ws, messageObj) {
        let player = initPlayer(ws, messageObj.playerId);

        let configuration = {
            type: "configuration",
            gameState: global.game.state,
            playerId: player.id,
            username: player.username,
            score: player.score,
            machineId: player.machineId
        };

        ws.send(JSON.stringify(configuration));
    }
);

const motionHandler = wrapMessageHandler(
    INCOMING_MESSAGE_TYPES.MOTION,
    function motionHandler(ws, messageObj) {
        axios({
            method: "POST",
            url: new URL("/gesture", GESTURE_API_URL).href,
            data: messageObj
        }).then(response => {
            log.debug("response from s3 gesture API: %j", response.data);
            let feedbackMsg = {
                uuid: messageObj.uuid,
                type: "motion_feedback",
                ...response.data
            };
            ws.send(JSON.stringify(feedbackMsg));

            let kafkaKey = messageObj.uuid || uuidv4();
            let playerId = messageObj.playerId || null;
            let machineId = null;
            if (playerId) {
                let player = players[playerId];
                machineId = player ? player.machineId : null;
            }

            let jsonMsg = JSON.stringify({
                vibrationClass: response.data.gesture,
                sensorId: playerId, machineId,
                confidencePercentage: response.data.probability
            });
            let kafkaMsg = Buffer.from(jsonMsg);
            log.debug(`gestureProducer.produce topic: ${GESTURE_TOPIC_NAME}; key: ${kafkaKey}; msg: ${jsonMsg}`);
            gestureProducer.produce(GESTURE_TOPIC_NAME, -1, kafkaMsg, kafkaKey);
        })
            .catch(error => {
                log.error("error occured in http call to s3 gesture API:");
                log.error(error);
            });
    }
);

const pingHandler = wrapMessageHandler(
    INCOMING_MESSAGE_TYPES.PING,
    function pingHandler(ws, messageObj) {
        log.debug("ping", messageObj);
    }
);

const scoreHandler = wrapMessageHandler(
    INCOMING_MESSAGE_TYPES.SCORE,
    function scoreHandler(ws, messageObj) {
        log.debug("score", messageObj);
        updateScore(messageObj);
    }
);

function initPlayer(ws, playerId) {
    let player;

    if (playerId && players[playerId]) {
        player = players[playerId];
        player.ws = ws;
    } else {
        player = new Player(ws, playerId);
        players[player.id] = player;
    }

    return player;
}

function updateScore(messageObj) {
    let {playerId, score, gesture, intensity, machineId} = messageObj;
    let player = players[playerId];
    player.score = player.score + score;
    player.ws.send({
        type: "score",
        total: player.score,
        score,
        gesture,
        intensity,
        machineId
    });
}

module.exports.processSocketMessage = processSocketMessage;
