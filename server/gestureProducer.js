const Kafka = require("node-rdkafka");
const env = require("env-var");
const log = require("./utils/log")("gesture-producer");

const host = env.get("KAFKA_BROKER_LIST_HOST").asString();
const port = env.get("KAFKA_BROKER_LIST_PORT").asString();

log.info('Creating Gesture Producer');

const producer = new Kafka.Producer({
  'metadata.broker.list': `${host}:${port}`,
  "dr_cb": true
});

const GESTURE_TOPIC_NAME = "data-filtered";

producer.on("event.log", function(log) {
  log.debug(log);
});


producer.on("event.error", function(err) {
  log.error("Error from gesture producer");
  log.error(err);
});

producer.on('delivery-report', function(err, report) {
  log.debug('delivery-report: ' + JSON.stringify(report));
});


producer.on("ready", function(arg) {
  log.info("Connected to Kafka. Gesture producer ready." + JSON.stringify(arg));
});

producer.on("disconnected", function(arg) {
  log.warn("Gesture producer disconnected from Kafka " + JSON.stringify(arg));
  log.info("Reconnecting gesture producer... ");
  producer.connect();
});

//starting the producer
producer.connect();

module.exports.gestureProducer = producer;
module.exports.GESTURE_TOPIC_NAME = GESTURE_TOPIC_NAME;

