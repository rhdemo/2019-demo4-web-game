const WebSocket = require("ws");
const axios = require("axios");
const log = require("../utils/log")("datagrid/poll-machines");
const GAME_STATES = require("../models/game-states");
const {OUTGOING_MESSAGE_TYPES} = require("../message-types");
let game = require("../data/game");
let players = require("../data/players");
let machines = require("../data/machines");

const MAX_HEALTH = 1000000000000000000;


function pollMachines(interval, alwaysPoll) {
  setInterval(async function () {
    const inactiveGameState = (game.state === GAME_STATES.LOBBY || game.state === GAME_STATES.LOADING);

    if (!alwaysPoll && inactiveGameState) {
      return;
    }

    let promises = [];

    machines.forEach((machine) => {
      promises.push(refreshMachine(machine, alwaysPoll));
    })

    let refreshResults = await Promise.all(promises);
    let updatedMachineIndexes = {};
    refreshResults.forEach(index => {
      if (index >= 0) {
        updatedMachineIndexes[index] = true;
      }
    });
    broadcastMachineChanges(updatedMachineIndexes);
  }, interval);
}

async function refreshMachine(machine, alwaysBroadcast) {
  try {
    let response = await axios({method: "get", url: machine.url});
    machine.value = response.data;
  } catch (error) {
    log.error(`error occurred in http call get counter for machine ${machine.id}`);
    log.error(error);
    return -1;
  }

  let percent = Math.floor(machine.value / MAX_HEALTH * 100);
  if (alwaysBroadcast || machine.percent !== percent) {
    machine.percent = percent;
    return machine.index;
  } else {
    return -1;
  }
}

function broadcastMachineChanges(updatedMachineIndexes) {
  for (let idKey in players) {
    if (players.hasOwnProperty(idKey)) {
      let player = players[idKey];

      if (player.ws.readyState !== WebSocket.OPEN) {
        log.info("Connection lost.  Delete player", players[idKey].username);
        delete players[idKey];
        continue;
      }

      if (updatedMachineIndexes[player.machineId] && player.ws.readyState === WebSocket.OPEN) {
        let machine = machines[player.machineId];
        let msgObj = {type: OUTGOING_MESSAGE_TYPES.MACHINE, id: player.machineId, percent: machine.percent};
        log.debug("send updated machine info", player.username, player.machineId, msgObj);
        try {
          player.ws.send(JSON.stringify(msgObj));
        } catch (error) {
          log.error(`Failed to send message to client.  Error: ${error.message}`);
        }
      }
    }
  }
}

module.exports = pollMachines;
