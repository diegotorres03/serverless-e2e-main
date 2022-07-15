const aws = require('aws-sdk')
const converter = aws.DynamoDB.Converter

const ordersQueue = process.env.QUEUE

class Order {
    /** @param {OrderJSON} json */
    constructor(json) {
        this.id = json.id
        this.customer = json.customer
        this.items = Array.isArray(json.items) ? [...json.items] : []
        this.staff = json.staff
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
async function saveToTimestream(order) {
    const params = {
        DatabaseName: process.env.TS_DB, /* required */
        Records: [ /* required */
            {
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
                MeasureName: 'STRING_VALUE',
                MeasureValue: 'STRING_VALUE',
                MeasureValueType: DOUBLE | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI,
                MeasureValues: [
                    {
                        Name: 'STRING_VALUE', /* required */
                        Type: DOUBLE | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI, /* required */
                        Value: 'STRING_VALUE' /* required */
                    },
                    /* more items */
                ],
                Time: 'STRING_VALUE',
                TimeUnit: MILLISECONDS | SECONDS | MICROSECONDS | NANOSECONDS,
                Version: 'NUMBER_VALUE'
            },
            /* more items */
        ],
        TableName: process.env.TS_TABLE, /* required */
        CommonAttributes: {
            Dimensions: [
                {
                    Name: 'STRING_VALUE', /* required */
                    Value: 'STRING_VALUE', /* required */
                    DimensionValueType: VARCHAR
                },
                /* more items */
            ],
            MeasureName: 'STRING_VALUE',
            MeasureValue: 'STRING_VALUE',
            MeasureValueType: DOUBLE | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI,
            MeasureValues: [
                {
                    Name: 'STRING_VALUE', /* required */
                    Type: DOUBLE | BIGINT | VARCHAR | BOOLEAN | TIMESTAMP | MULTI, /* required */
                    Value: 'STRING_VALUE' /* required */
                },
                /* more items */
            ],
            Time: 'STRING_VALUE',
            TimeUnit: MILLISECONDS | SECONDS | MICROSECONDS | NANOSECONDS,
            Version: 'NUMBER_VALUE'
        }
    }
    console.log(params)
    timestreamwrite.writeRecords(params, function (err, data) {
        if (err) console.log(err, err.stack) // an error occurred
        else console.log(data)           // successful response
    })
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