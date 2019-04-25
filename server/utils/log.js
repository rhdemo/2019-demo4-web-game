const log4js = require("log4js");
const env = require("env-var");
const assert = require("assert");

const level = env.get("LOG_LEVEL", "info").asEnum([
  "trace",
  "debug",
  "info",
  "warn",
  "error"
]);

let prodConfig = {
  appenders: {
    console: {
      type: "console",
      layout: {
        type: "basic"
      }
    }
  },
  categories: {
    default: {
      appenders: ["console"],
      level: level
    }
  }
};

let devConfig = {
  appenders: {
    console: {
      type: "console"
    }
  },
  categories: {
    default: {
      appenders: ["console"],
      level: level
    }
  }
};

if (process.env.NODE_ENV === "development") {
  log4js.configure(devConfig);
} else {
  log4js.configure(prodConfig);
}

/**
 * Creates a log4js logger instance with a globally configured log level
 * @param {String} name
 */
module.exports = function getLogger(name) {
  assert(name, "logger instances must be named");

  return log4js.getLogger(name);
};
