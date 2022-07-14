// Declaring environments here so the imported lambda funtion
// would get access to its definitions
process.env.ORDERS_TABLE = 'test-orders'

const expect = require('chai').expect
const awsMock = require('aws-sdk-mock')
const aws = require('aws-sdk')
const index = require('./index')

awsMock.setSDKInstance(aws)

describe('Create Order Success', () => {

  const event = {
    body: JSON.stringify({
      id: '123',
      customer: 'alejo',
      items: [{ name: 'sample', type: 'sample', qty: 1 }],
      staff: 'alejo'
    })
  }

  beforeEach(() => {
    awsMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      callback(null, 'OK')
    })
  })

  afterEach(() => {
    awsMock.restore('DynamoDB.DocumentClient')
  })

  it('Should create an order', async () => {
    const result = await index.handler(event)
    expect(result.statusCode).to.equal(200)
  }).timeout(5000)

  it('Should return specific headers', async () => {
    const result = await index.handler(event)
    expect(result.headers['Access-Control-Allow-Headers']).to.equal('Content-Type')
    expect(result.headers['Access-Control-Allow-Origin']).to.equal('*')
    expect(result.headers['Access-Control-Allow-Methods']).to.equal('OPTIONS,POST,GET,PUT,PATCH')
  }).timeout(5000)
})
