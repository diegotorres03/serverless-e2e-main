const { handler } = require('./index')

const event = {
    "Records": [
        {
            "eventID": "3315d2207c2fe84a61189336e4f52eed",
            "eventName": "REMOVE",
            "eventVersion": "1.1",
            "eventSource": "aws:dynamodb",
            "awsRegion": "us-east-2",
            "dynamodb": {
                "ApproximateCreationDateTime": 1657900134,
                "Keys": {
                    "id": {
                        "S": "1657899467502"
                    },
                    "customer": {
                        "S": "diegotrs"
                    }
                },
                "OldImage": {
                    "id": {
                        "S": "1657899467502"
                    },
                    "items": {
                        "L": [
                            {
                                "M": {
                                    "qty": {
                                        "N": "1"
                                    },
                                    "name": {
                                        "S": "coffe"
                                    },
                                    "type": {
                                        "S": "beberage"
                                    }
                                }
                            },
                            {
                                "M": {
                                    "qty": {
                                        "N": "1"
                                    },
                                    "name": {
                                        "S": "capuccino"
                                    },
                                    "type": {
                                        "S": "beberage"
                                    }
                                }
                            }
                        ]
                    },
                    "_expireOn": {
                        "N": "1657899589.456"
                    },
                    "customer": {
                        "S": "diegotrs"
                    }
                },
                "SequenceNumber": "37953800000000003109900519",
                "SizeBytes": 157,
                "StreamViewType": "NEW_AND_OLD_IMAGES"
            },
            "userIdentity": {
                "principalId": "dynamodb.amazonaws.com",
                "type": "Service"
            },
            "eventSourceARN": "arn:aws:dynamodb:us-east-2:778599875342:table/backend-orders46FA7C19-NV4XDQRHCB58/stream/2022-07-07T16:03:53.945"
        }
    ]
}

handler(event)
    .then(console.log)
    .catch(console.error)

