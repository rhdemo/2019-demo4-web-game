const log4js = require("log4js");
log4js.configure({
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
      level: "info"
    }
  }
});
