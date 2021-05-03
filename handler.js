'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper'); 
const producerManager = require('./producerManager');
const deliveryManager = require('./deliveryManager.js');

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

module.exports.notifyExternalParties = async (event) => {
  const record = kinesisHelper.getRecords(event);

  const producerPromise = getProducerPromise(records);
  const deliveryPromise = getDeliveryPromise(records);

  return Promise.all([producerPromise, deliveryPromise]).then(() => {
    return 'Everything went well!'
  }).catch(error => {
    return errror;
  })
}

module.exports.notifyDeliveryCompany = async (event) => {
  // HTTP Call
  Console.log('Call delivery company endpoint')

  return 'DONE!';
}

module.exports.orderDelivered = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId;
  const deliveryCompanyId = body.deliveryCompanyId;
  const orderReview = body.orderReview;

  return deliveryManager.orderDelivered(orderId, deliveryCompanyId, orderReview).then(() => {
    return createResponse(200, `Order with ${orderId} was delivered successfully by companyId ${deliveryCompanyId}`); 
  }).catch(error => {
    return createResponse(400, error);
  })
}

module.exports.notifyCustomerService = async (eventType) => {
  console.log('Call customer service endpoint');

  return 'DONE';
}
function getProducerPromise(records) {
  const ordersPlaced = records.filter(r => r.eventType == 'order_placed');

  if (ordersPlaced.length > 0) {
    return producerManager.handlePlacedOrders(ordersPlaced);
  } else {
    return null;
  }
} 

function getDeliveryPromise(records) {
  const orderFulfilled = records.filter(r => r,eventType == 'order_fulfilled');

  if (orderFulfilled.length > 0) {
    return deliveryManager.deliveryOrder(orderFulfilled);
  } else {
    return null;
  }
}