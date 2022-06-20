const aws = require('aws-sdk')

const dynamo = new aws.DynamoDB.DocumentClient({ region: 'us-east-2' })
const ordersTable = 'restApiStack-orders46FA7C19-1DABCQPL86S99'

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
    const eventJson = JSON.stringify(event, null, 2)
    console.log(eventJson)
    const order = new Order(JSON.parse(event.body))
    // [x] TODO save order on dynamodb table
    await dynamo.put({
        TableName: ordersTable,
        Item: order
    }).promise()
    return {
        body: JSON.stringify(order),
        statusCode: 200,
    };
}

module.exports = { handler };
