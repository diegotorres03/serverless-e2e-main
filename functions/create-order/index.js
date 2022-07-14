const ordersTable = process.env.ORDERS_TABLE

const aws = require('aws-sdk')
class Order {
    /** @param {OrderJSON} json */
    constructor(json) {
        this.id = json.id
        this.customer = json.customer
        this.items =Array.isArray(json.items) ? [ ...json.items ] : []
        this.staff = json.staff
    }

    addItem(name, type, qty) {
        this.items.push({ name, type, qty })
    }
}

async function handler(event) {
    const dynamo = new aws.DynamoDB.DocumentClient({ region: 'us-east-2' })
    const eventJson = JSON.stringify(event, null, 2)

    console.log(eventJson)
    const order = new Order(JSON.parse(event.body))
    // [ ] 3.3.2: use table on createOrder - save order on dynamodb table [docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property)

    await dynamo.put({
        TableName: ordersTable,
        Item: order
    }).promise()
    return {
        body: JSON.stringify(order),
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,PATCH"
        },
    }
}

module.exports = { handler };
