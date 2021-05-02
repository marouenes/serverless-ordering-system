'use strict';

const orderManager = require('./orderManager');

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
