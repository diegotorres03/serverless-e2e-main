const axios = require('axios').default

const { apiUrl } = require('../../api.json').api
const { expect } = require('chai')

const ordersUrl = `${apiUrl}orders`

// beforeEach(() => {
//     // initializeCityDatabase()
// })

// afterEach(() => {
//     // clearCityDatabase()
// })

const order = {
    id: Date.now().toString(),
    customer: 'diegotrs',
    items: [
        { name: 'capuccino', type: 'beberage', qty: 1 },
        { name: 'avocado toast', type: 'meal', qty: 1 },
    ],
}

it('create an order', async () => {
    const res = await axios.post(ordersUrl, order)
    expect(res.data).to.have.property('customer').to.be.eq(order.customer)
    expect(res.data).to.have.property('id').to.be.eq(order.id)
    expect(res.data).to.have.property('items').to.be.deep.eq(order.items)
})

it('get orders', async () => {
    const res = await (axios.get(ordersUrl))
    // console.log(res.data)
    res.data.forEach(order => {

        expect(order).to.have.property('customer').to.be.a('string')
        expect(order).to.have.property('id').to.be.a('string')
        expect(order).to.have.property('items').to.be.a('array')
        order.items.forEach(item => {

            expect(item).to.have.property('name').to.be.a('string')
            expect(item).to.have.property('type').to.be.a('string')
            expect(item).to.have.property('qty').to.be.a('number').greaterThan(0)
        })
    })
})