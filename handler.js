'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper'); 
const producerManager = require('./producerManager');

function createResponse(StatusCode, message) {
  const response = {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };

  return response;
}

module.exports.createOrder = async (event) => {

  const body = JSON.parse(event.body);
  const order = orderManager.createOrder(body); 

  return orderManager.placeNewOrder(order).them(() => {
    return createResponse(200, order);
  }).catch(error => {
    return createResponse(400, error);
  })
};

module.exports.orderFulfillement = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId;
  const  fulfillementId = body.fulfillementId;

  return orderManager.fulfillOrder(orderId, fulfillementId).then(() => {
    return createResponse(200, `Order with orderId:${orderId} was sent to delivery`);
  }).catch(error => {
    return createResponse(400, error);
  })
}

module.exports.notfiyProducer = async (event) => {
  const record = kinesisHelper.getRecords(event);

  const ordersPlaced = records.filter(r => r.eventType == 'order_placed');

  if (ordersPlaced <= 0) {
   return 'There is nothing';
  }

  producerManager.handlePlacedOrders(ordersPlaced).then(() => {
    return 'Everything went well!'
  }).catch(error => {
    return errror;
  })
}