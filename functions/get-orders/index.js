const aws = require('aws-sdk')

const dynamo = new aws.DynamoDB.DocumentClient({ region: 'us-east-2' })
// const ordersTable = 'restApiStack-orders46FA7C19-1DABCQPL86S99'
const ordersTable = process.env.ORDERS_TABLE


class Order {
    /** @param {OrderJSON} json */
    constructor(json) {
        this.id = json.id
        this.customer = json.customer
        this.items = Array.isArray(json.items) ? [...json.items] : []
        this.staff = json.staff
        this._createdAt = Date.now()
        this._procecedAt = null
        this._filledAt = null
        this._expireOn = json._expireOn || (new Date().getTime() / 1000) + 2 * 60
    }

    addItem(name, type, qty) {
        this.items.push({ name, type, qty })
    }
}

async function handler(event) {
    const eventJson = JSON.stringify(event, null, 2)
    console.log(eventJson)
    // [ ] 3.2.1: use table on getOrders - get all orders from dynamodb [docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property)
    const res = await dynamo.scan({
        TableName: ordersTable,
    }).promise()
    console.log(res.Items)
    return {
        body: JSON.stringify(res.Items.map(item => new Order(item))),
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,PATCH"
        },
    }
}

module.exports = { handler }
