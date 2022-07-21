const ordersTable = process.env.ORDERS_TABLE

const aws = require('aws-sdk')

async function handler(event) {
    const eventJson = JSON.stringify(event, null, 2)
    console.log(eventJson)

    const username = event.body.username

    return {
        body: JSON.stringify({}),
        statusCode: 200,
        headers: {
            "Authorization": "json.web.token",
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,PATCH"
        },
    }
}

module.exports = { handler }
