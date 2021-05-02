'use strict'

const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient(); 
const  kinesis = new AWS.Kinesis();

const TABLE_NAME = proces.env.orderTableName;
const STREAM_NAME = proces.env.orderStreamName;

module.exports.createOrder = body => {
    const order = {
        orderId: uuidv1(),
        name: body.name,
        address: body.address,
        productId: body.productId,
        quantity: body.quantity,
        orderDate: Date.now,
        eventType: 'order_place'
    }

    return order;
}

module.exports.placeNewOrder = order => {
    // save order in table (DynamoDB)
    return saveNewOrder(order).then(() => {
        return placeOrderStream(order)
    })
}

function saveNewOrder(order) {
    const params = {
        TableName: TABLE_NAME,
        Item: order 
    }

    return dynamo.put(param).promise()
}

function placeOrderStream(order) {
    const params = {
        Data: JSON.stringify(order),
        PartitionKey: order.orderId,
        StreamName: STREAM_NAME
    } 

    return kinesis.putRecord(params).promise();
} 