// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

// Create a DocumentClient that represents the query to delete an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to delete one item by email from a DynamoDB table.
 */
exports.deleteUserHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
 
  // Get email from pathParameters from APIGateway because of `/delete/{id}` at template.yaml
  const email = event.pathParameters.email;
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  var params = {
    TableName : tableName,
    Key: { email: email },
  };
  const data = await docClient.delete(params).promise();
  const item = data.Item;
 
  const response = {
    statusCode: 200,
    body: JSON.stringify(item)
  };
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
