const v8 = require("v8");
const log = require("./log")("log-heap");

async function logHeap() {
  const heapStats = v8.getHeapStatistics();

  if (!heapStats) {
    log.warn("Unable to retrieve heap stats");
    return;
  }

  const usedHeapSize = heapStats.used_heap_size;
  const totalHeapSize = heapStats.total_available_size;

  let usedHeapSizaInMB = (usedHeapSize / 1024 / 1024).toFixed(2);
  let totalHeapSizaInMB = (totalHeapSize / 1024 / 1024).toFixed(2);
  let percentUsage = (usedHeapSize / totalHeapSize * 100).toFixed(2);

  log.info(`V8 Heap Usage: ${usedHeapSizaInMB}MB / ${totalHeapSizaInMB}MB (${percentUsage}%)`);
  log.info(heapStats);
}

module.exports = logHeap;
