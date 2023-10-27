const RabbitMq = require('./init.rabbitmq');
const { NOTIFICATION_CONFIG } = require('../configs/configurations');

const initializeRabbitMQ = () => {
  return RabbitMq.getInstance(NOTIFICATION_CONFIG?.EXCHANGES?.notify, NOTIFICATION_CONFIG?.NOTIFY_QUEUES?.notify);
};

module.exports = initializeRabbitMQ;