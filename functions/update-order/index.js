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
     // [x] TODO: patch an order on dynamodb table
     const orderId = event.pathParameters.id
     const cusotmer = event.pathParameters.customer 
     const status = JSON.parse(event.body).status
     console.log('updating orderId:', orderId)
     const res = await dynamo.update({
         TableName: ordersTable,
         Key: {
             id: orderId,
             customer: cusotmer,
         },
         ExpressionAttributeNames: {'#status': 'status'},
         ExpressionAttributeValues: {':status': status},
         UpdateExpression: `set #status = :status`,
 
     }).promise()
    return {
        body: JSON.stringify(res),
        statusCode: 200,
    };
}

module.exports = { handler }
