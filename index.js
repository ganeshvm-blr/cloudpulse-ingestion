const zlib = require("zlib");
const AWS = require("aws-sdk");

const ddb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "CloudPulseEvents";

function parseReport(logs) {
    let durationMs = null;
    let billedMs = null;
    let memoryMb = null;
    let requestId = null;

    for (const log of logs) {
        const msg = log.message;

        if (msg.startsWith("REPORT RequestId")) {
            requestId = msg.match(/RequestId:\s([a-zA-Z0-9-]+)/)?.[1] || "unknown";

            const duration = msg.match(/Duration:\s([0-9.]+)\sms/);
            const billed = msg.match(/Billed Duration:\s([0-9.]+)\sms/);
            const memory = msg.match(/Max Memory Used:\s([0-9.]+)\sMB/);

            durationMs = duration ? Number(duration[1]) : null;
            billedMs = billed ? Number(billed[1]) : null;
            memoryMb = memory ? Number(memory[1]) : null;
        }
    }

    return { requestId, durationMs, billedMs, memoryMb };
}

exports.handler = async (event) => {
    console.log("SOURCE_EVENT:", JSON.stringify(event));

    if (!event.awslogs?.data) return { statusCode: 200 };

    const compressed = Buffer.from(event.awslogs.data, "base64");
    const decompressed = zlib.gunzipSync(compressed).toString("utf8");
    const data = JSON.parse(decompressed);

const service = data.logGroup.replace("/aws/lambda/", "");
    // ONE INVOCATION = ONE METRIC RECORD
    const report = parseReport(data.logEvents || []);

    const item = {
        pk: `SERVICE#${service}`,
        sk: `TIME#${Date.now()}#${report.requestId}`,

        service,
        requestId: report.requestId,

        durationMs: report.durationMs,
        billedMs: report.billedMs,
        memoryMb: report.memoryMb,

        timestamp: new Date().toISOString()
    };

    await ddb.put({
        TableName: TABLE_NAME,
        Item: item
    }).promise();

    console.log("Wrote 1 metric event");

    return { statusCode: 200 };
};
