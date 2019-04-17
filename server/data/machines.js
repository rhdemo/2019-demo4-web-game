const env = require("env-var");

const DATAGRID_HOST = env.get("DATAGRID_HOST").asString();
const DATAGRID_CONSOLE_HOST = env.get("DATAGRID_CONSOLE_HOST", DATAGRID_HOST).asString();
const DATAGRID_CONSOLE_PORT = env.get("DATAGRID_CONSOLE_PORT").asIntPositive();

const MAX_MACHINES = 10;

let machineUrl = datagridKey => {
  return 'http://' +
    `${DATAGRID_CONSOLE_HOST}:${DATAGRID_CONSOLE_PORT}` +
    '/management/subsystem/datagrid-infinispan/cache-container/clustered/counters/COUNTERS/strong-counter/' +
    datagridKey + '?operation=attribute&name=value';
};

let machines = [];

for (let i = 0; i < MAX_MACHINES; i++) {
  let index = i;
  let id = `machine-${i}`;
  let url = machineUrl(id);
  machines[index] = {index, id, url};
}

module.exports = machines;
