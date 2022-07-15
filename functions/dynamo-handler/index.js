const aws = require('aws-sdk')
const converter = aws.DynamoDB.Converter

const ordersQueue = process.env.QUEUE

class OrderItem {
    constructor(params) {
        this.name = params.name || ''
        this.type = params.type || ''
        this.qty = Number(params.qty) || 0
    }
}
class Order {
    /** @param {OrderJSON} json */
    constructor(json) {
        this.id = json.id
        this.customer = json.customer
        this.staff = json.staff
        this._createdAt = Date.now()
        this._procecedAt = null
        this._filledAt = null
        this._expireOn = json._expireOn || (new Date().getTime() / 1000) + 2 * 60
        
        /** @param {OrderItem[]} items */
        this.items = Array.isArray(json.items) ?
            json.items.map(item => new OrderItem(item)) : []
            
    }

    addItem(name, type, qty) {
        this.items.push({ name, type, qty })
    }
}

const queueUrl = process.env.QUEUE

const queue = new aws.SQS()

const timestreamWrite = new aws.TimestreamWrite()

async function handler(event) {
    const eventJson = JSON.stringify(event, null, 2)
    console.log(eventJson)
    const responses = event.Records.map(record => {
        const newItem = converter.unmarshall(record.dynamodb.NewImage)
        console.log('Record', JSON.stringify(newItem, null, 2))

        if (record.eventName === 'REMOVE') {
            // return send to timestream
        }

        if (record.eventName === 'MODIFY') {
            // return send to timestream
        }


        // [ ] get messages from dynamodb stream add them to queue
        return queue.sendMessage({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(newItem)
        }).promise().catch(err => console.error(err))
    })

    const response = await Promise.all(responses)

    console.log(JSON.stringify(response, null, 2))

    return {
        body: JSON.stringify({ json: response }),
        statusCode: 200,
    }
}


/**
 *
 *
 * @param {Order} order
 */
function getRecord(order) {
    const record = {
        Dimensions: [
            {
                Name: 'customer',
                Value: order.customer,
                DimensionValueType: 'VARCHAR',
            },
            {
                Name: 'orderId',
                Value: order.id,
                DimensionValueType: 'VARCHAR',
            },
            {
                Name: 'staff',
                Value: order.staff,
                DimensionValueType: 'VARCHAR',
            },
            /* more items */
        ],
        MeasureName: 'orderStats',
        // MeasureValue: 'STRING_VALUE',
        // MeasureValueType: DOUBLE | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI,
        MeasureValues: [
            {
                Name: 'processTime', /* required */
                Type: DOUBLE | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI, /* required */
                Value: order._procecedAt - order._createdAt /* required */
            },
            {
                Name: 'completionTie', /* required */
                Type: 'DOUBLE', // | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI, /* required */
                Value: order._filledAt - order._createdAt /* required */
            },
            {
                Name: 'itemCount', /* required */
                Type: 'DOUBLE', // | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI, /* required */
                Value: order.items.reduce(prev, current => prev.qty + current.qty) /* required */
            },
        ],
        Time: order._createdAt,
        TimeUnit: 'MILLISECONDS', // | SECONDS | MICROSECONDS | NANOSECONDS,
        // Version: 'NUMBER_VALUE'
    }
    return record
}

/**
 *
 *
 * @param {Order[]} orders
 */
async function saveToTimestream(orders) {
    const records = orders.map(getRecord)
    const params = {
        TableName: process.env.TS_TABLE, /* required */
        DatabaseName: process.env.TS_DB, /* required */
        Records: [ records ],
    }
    console.log(params)
    // timestreamwrite.writeRecords(params, function (err, data) {
    //     if (err) console.log(err, err.stack) // an error occurred
    //     else console.log(data)           // successful response
    // })
}

module.exports = { handler }



/* example event
{
    "Records": [
        {
            "eventID": "b90c0a796441306a16beb9f57636ed22",
            "eventName": "INSERT",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-2",
            "dynamodb": {
                "ApproximateCreationDateTime": 1655508116,
                "Keys": {
                    "id": {
                        "S": "1"
                    },
                    "customer": {
                        "S": "diegotrs"
                    }
                },
                "NewImage": {
                    "id": {
                        "S": "1"
                    },
                    "customer": {
                        "S": "diegotrs"
                    },
                    "status": {
                        "S": "created"
                    }
                },
                "SequenceNumber": "100000000000914665584",
                "SizeBytes": 51,
                "StreamViewType": "NEW_AND_OLD_IMAGES"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-2:778599875342:table/backendStack-orders46FA7C19-1RIJLS4NAJ2F7/stream/2022-06-17T23:18:40.337"
        }
    ]
}


*/