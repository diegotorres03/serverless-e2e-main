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

    const orders = [{
        id: 'test',
        customer: 'test',
        items: [],
        staff: null
    }]
    
    // [ ] 3.2.1 use table on getOrders - get all orders from dynamodb
    
    return {
        body: JSON.stringify(orders),
        statusCode: 200,
    };
}

module.exports = { handler }
