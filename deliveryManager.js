'use strict'

const orderManager = require('./orderManager');
const customerServiceManager = require('./customerServiceManager');

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: process.env.region
});

const DELIVERY_COMPANY_QUEUE = process.env.deliveryCompanyQueue;

module.exports.deliveryOrder = ordersFulfilled => {

    var orderFulfilledPromises = [];

    for (let order of orderFulfilled) {
        const temp = orderManager.updateOrderForDelivery(order.orderId).then(updateOrder => {
            orderManager.saveOrder(updateOrder).then(() => {
                notifyDeliveryCompany(updateOrder);
            });
        });

        orderFulfilledPromises.push(temp);
    };

    return Promise.all(orderFulfilledPromises); 
}

module.exports.orderDelivered = (orderId, deliveryCompanyId, orderReview) => {
    return orderManager.updateOrderAfterDelivery(orderId, deliveryCompanyId).then(updatedorder => {
        return orderManager.saveOrder(updatedorder).then(() => {
            return customerServiceManager.notifyCustomerServiceForReview(orderId, orderReview);
        });
    });
}
function notifyDeliveryCompany(order) {
    const params = {
        MessageBody: JSON.stringify(order),
        QueueUrl: DELIVERY_COMPANY_QUEUE
    };

    return sqs.sendMessage(params).promise();
}