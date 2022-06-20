const aws = require('aws-sdk')

const ordersQueue = process.env.QUEUE

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
    // [ ] get messages from sqs and auto approve them
    return {
        body: JSON.stringify({json: eventJson}),
        statusCode: 200,
    };
}

module.exports = { handler }
