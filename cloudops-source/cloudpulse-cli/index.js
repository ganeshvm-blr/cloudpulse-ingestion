console.log("CLI STARTED");

const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient({
  region: "us-east-1",
});

const args = process.argv.slice(2);

const command = args[0];
const service = args[1];

console.log("ARGS:", process.argv);
console.log("DEBUG command =", command);
console.log("DEBUG service =", service);

// -----------------------------
// FETCH LOGS
// -----------------------------
async function fetchLogs(service) {
  const params = {
    TableName: "CloudPulseEvents",
    KeyConditionExpression: "service = :s",
    ExpressionAttributeValues: {
      ":s": service,
    },
  };

  const result = await dynamo.query(params).promise();
  return result.Items || [];
}

// -----------------------------
// EXTRACT DURATION ONLY FROM REPORT LOGS
// -----------------------------
function extractDurationMs(log) {
  const text =
    log.raw ||
    log.message ||
    "";

  if (typeof text !== "string") return null;

  const match = text.match(/Duration:\s*([\d.]+)\s*ms/);
  if (!match) return null;

  return parseFloat(match[1]);
}

// -----------------------------
// STATS
// -----------------------------
async function stats(service) {
  console.log("DEBUG: stats called with service =", service);

  const logs = await fetchLogs(service);

  console.log("DEBUG: logs returned =", logs.length);

  if (!logs.length) {
    console.log("No logs found.");
    return;
  }

  // ONLY REPORT LATENCIES
  const durations = logs
    .map(extractDurationMs)
    .filter((v) => typeof v === "number" && !isNaN(v))
    .sort((a, b) => a - b);

  console.log("DEBUG durations extracted =", durations);

  const percentile = (p) => {
    if (!durations.length) return null;

    const rank = (p / 100) * (durations.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);

    if (lower === upper) return durations[lower];

    const weight = rank - lower;

    return (
      durations[lower] * (1 - weight) +
      durations[upper] * weight
    );
  };

  const p50 = percentile(50);
  const p95 = percentile(95);
  const p99 = percentile(99);

  const totalRequests = durations.length;

  console.log(`\n📊 CloudPulse Metrics: ${service}`);
  console.log("--------------------------------");
  console.log(`Total Requests: ${totalRequests}`);
  console.log(`p50 Latency: ${p50 ?? "N/A"} ms`);
  console.log(`p95 Latency: ${p95 ?? "N/A"} ms`);
  console.log(`p99 Latency: ${p99 ?? "N/A"} ms`);
}

// -----------------------------
// ROUTER
// -----------------------------
(async () => {
  try {
    if (command === "stats") {
      await stats(service);
    } else {
      console.log("Unknown command:", command);
    }
  } catch (err) {
    console.error("CLI ERROR:", err);
  }
})();
