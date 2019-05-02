const http = require("http");
const httpAgent = new http.Agent({ keepAlive: true });

module.exports = require("axios").create({
  timeout: 5000,
  httpAgent
})
