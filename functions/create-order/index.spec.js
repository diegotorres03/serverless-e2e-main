process.env.ORDERS_TABLE = 'test-orders'

const expect = require('chai').expect
const index = require('./index')

console.log(index)

describe('Create Ordert', () => {
    it('should create an order', async () => {
        const event = {
            body: JSON.stringify({
                id: '123',
                customer: 'alejo',
                items: [{ name: 'sample', type: 'sample', qty: 1 }],
                staff: 'alejo'
            })
        }
        const result = await index.handler(event)
        expect(result.statusCode).to.equal(200)
    }).timeout(5000)
})
