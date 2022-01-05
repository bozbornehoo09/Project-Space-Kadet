// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.addUserHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Validate body parameters
    const body = JSON.parse(event.body)
    if (!(body.hasOwnProperty('email') && body.hasOwnProperty('name')
        && body.hasOwnProperty('coinbaseAPIKey') 
        && body.hasOwnProperty('amountToInvestDaily'))){
            throw new Error(`Request Missing one or more of the following properties in the body: email, name, coinbaseAPIKey, amountToInvestDaily`);
        }
    const email = body.email;
    const name = body.name;
    const coinbaseAPIKey = body.key;
    const amountToInvestDaily = body.amount;

    //Check User does not already exist in the
    const quickSearchParams ={
        TableName: tableName,
        Key: {email: email}
    };
    const check = await docClient.get(quickSearchParams).promise();
    console.log(check);
    if (check.hasOwnProperty("Item")) { // {} is what is returned from docClient when no PK found
        throw new Error(`The email ${email} is already registered to a user`);
    }

    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    var params = {
        TableName : tableName,
        Item: { 
            email : email, 
            name: name,
            coinbaseAPIKey: coinbaseAPIKey,
            amountToInvestDaily: amountToInvestDaily
        }
    };

    console.info('params Table:', params.TableName);
    console.info('params Item', params.Item);
    const result = await docClient.put(params).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify(body)
    };

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
