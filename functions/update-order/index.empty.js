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
    const eventJson = JSON.stringify(event, null, 2)
    console.log(eventJson)
    const orderId = event.pathParameters.id
    const cusotmer = event.pathParameters.customer 
    const status = JSON.parse(event.body).status

    // [ ] 3.2.3: use table on updateOrder - patch an order on dynamodb table
    return {
        body: JSON.stringify({orderId, cusotmer, status}),
        statusCode: 200,
    };
}

module.exports = { handler }
