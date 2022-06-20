const aws = require('aws-sdk')

const dynamo = new aws.DynamoDB.DocumentClient({ region: 'us-east-2' })
// const ordersTable = 'restApiStack-orders46FA7C19-1DABCQPL86S99'
const ordersTable = process.env.ORDERS_TABLE

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
    // [x] TODO get all orders from dynamodb
    const res = await dynamo.scan({
        TableName: ordersTable,
    }).promise()
    return {
        body: JSON.stringify(res.Items.map(item => new Order(item))),
        statusCode: 200,
    };
}

module.exports = { handler }
