async function fetchLogs(service) {
  const normalizedService = service.replace("/aws/lambda/", "");

  const params = {
    TableName: "CloudPulseEvents",
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": `SERVICE#${normalizedService}`,
    },
  };

  const result = await dynamo.query(params).promise();
  return result.Items || [];
}
