const ADJECTIVES = require("./adjectives");
const NOUNS = require("./nouns");

let usedNames = new Set();

const resetUserNames = () => {
  usedNames.clear();
};

const generateUserName = () => {
  let i = 0;
  let username = null;
  while (i < 100) {
    let adjIndex = Math.floor(Math.random() * ADJECTIVES.length);
    let nounIndex = Math.floor(Math.random() * NOUNS.length);
    username = ADJECTIVES[adjIndex] + " " + NOUNS[nounIndex];

    if (usedNames.has(username)) {
      i++;
    } else {
      usedNames.add(username);
      return username;
    }
  }

  username += "" + Math.random().toString(36).substring(8);
  usedNames.add(username);
  return username;
};

module.exports.resetUserNames = resetUserNames;
module.exports.generateUserName = generateUserName;