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


/**
 * @api {post} /orders create an order on ddbb
 * @apiName CreateOrder
 * @apiGroup Orders
 *
 * @apiBody {OrderJSON} order order
 * @apiSuccess {OrderJSON} log newly created log.
 * @apiSuccessExample {type} Success-Response:
 * {
 *    "username": "alejo",
 *    "date": "1656017418934",
 *    "notes": [
 *     "sample text"
 *    ],
 *    "options": {
 *     "bowType": "recurve",
 *     "category": "junior",
 *     "gender": "male"
 *    },
 *    "value": 90,
 *    "_autoapprove": 1656018019
 * }
 * 
 */
async function handler(event) {
    const eventJson = JSON.stringify(event, null, 2)
    console.log(eventJson)
    const order = new Order(JSON.parse(event.body))

    // [ ] 3.2.2: use table on createOrder - save order on dynamodb table

    
    return {
        body: JSON.stringify(order),
        statusCode: 200,
    };
}

module.exports = { handler }
