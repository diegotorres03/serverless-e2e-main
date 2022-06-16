// using claudia api builder


/**
 * @typedef {{
 *  name: string,
 *  type: string,
 *  qty: number 
 * }} ItemJSON
 */

/**
 * @typedef {{
 *  id: string, 
 *  customer: string, 
 *  items: ItemJSON[],
 *  staff: string
 * }} OrderJSON
 */


const ApiBuilder = require('claudia-api-builder')
const api = new ApiBuilder()

module.exports = api


const orders = [{
    id: 1,
    items: [
        { type: 'food', name: 'croisant', qty: 1 },
        { type: 'drink', name: 'capuccino', qty: 1 },
    ],
    customer: 1, 
    staff: 1
}]

class Order {
    /** @param {OrderJSON} json */
    constructor(json) {
        this.id = json.id
        this.customer = json.customer
        this.items = [ ...json.items ]
        this.staff = json.staff
    }

    addItem(name, type, qty) {
        this.items.push({ name, type, qty })
    }
}

/**
 * 
 * @api {GET} /orders getOrders
 * @apiName AWSomeCafe
 * @apiGroup orders
 * @apiVersion  1.0.0
 * 
 * 
 * @apiParam  {String} paramName description
 * 
 * @apiSuccess (200) {type} name description
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 * 
 * @apiSuccess (200) {OrdersJSON[]} orders all current orders
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 * 
 * 
 */
api.get('/orders', request => {
    // [ ] TODO get all orders from dynamodb
    return orders
})

/**
 * 
 * @api {POST} /orders createOrder
 * @apiName AWSomeCafe
 * @apiGroup orders
 * @apiVersion  1.0.0
 * 
 * 
 * @apiParam  {OrderJSON} order the new order to be created
 * 
 * @apiSuccess (200) {OrderJSON} order newly created order
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 * 
 * 
 */
api.post('/orders', request => {
    const order = new Order(request.body)
    orders.push(order)
    // [ ] TODO save order on dynamodb table
    return order
})

/**
 * 
 * @api {PATCH} /orders updateOrderStatus
 * @apiName AWSomeCafe
 * @apiGroup orders
 * @apiVersion  1.0.0
 * 
 * 
 * @apiParam  {String} paramName orderId
 * 
 * @apiSuccess (200) {type} name description
 * 
 * @apiParamExample  {type} Request-Example:
 * {
 *     property : value
 * }
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
 * {
 *     property : value
 * }
 * 
 * 
 */
api.patch('/orders/{id}', request => {
    const orderIndex = orders.findIndex(order => order.id === request.path.id)
    if(orderIndex === -1) return new Error('Not foud')
    orders[orderIndex].status = request.body.status
    // [ ] TODO: patch an order on dynamodb table
    return
})