const { Queue } = require("bullmq");
const Redis = require("ioredis");

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("Brak REDIS_URL w zmiennych środowiskowych.");
}

const queueRedis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
});

queueRedis.on("error", (err) => {
  console.error("[Redis Queue] Błąd połączenia:", err.message);
});

const reportQueue = new Queue("reports", {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600,
      count: 1000,
    },
  },
});

reportQueue.on("error", (err) => {
  console.error("[BullMQ Queue] Błąd instancji kolejki:", err.message);
});

async function enqueueReport(token) {
  if (!token) {
    throw new Error("Brak tokenu do dodania joba.");
  }

  return reportQueue.add(
    "generate-report",
    { token },
    {
      jobId: `report-${token}`,
    }
  );
}

async function closeQueueResources() {
  await reportQueue.close();
  await queueRedis.quit();
}

module.exports = {
  reportQueue,
  enqueueReport,
  closeQueueResources,
};