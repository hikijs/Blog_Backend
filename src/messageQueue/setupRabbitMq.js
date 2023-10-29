const RabbitMq = require('./init.rabbitmq');
const { NOTIFICATION_CONFIG } = require('../configs/configurations');

const initializeRabbitMQ = async () => {
    console.time(">>> MQ Setup")
    try {
        await RabbitMq.getInstance(NOTIFICATION_CONFIG?.EXCHANGES?.notify, NOTIFICATION_CONFIG?.NOTIFY_QUEUES?.notify);
        console.log("Connect to Rabbit MQ Success")
    } catch (error) {
        console.log("Connect to Rabbit MQ Failure")
        console.error(error)
        throw new Error(error)
    }
    console.timeEnd(">>> MQ Setup")
};

module.exports = initializeRabbitMQ;