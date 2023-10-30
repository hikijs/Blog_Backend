const RabbitMq = require('../../src/messageQueue/setupRabbitMq');
const { initializeDatabase } = require('../../src/dbs/setupDatabase');
const initializeRabbitMQ = require('../../src/messageQueue/setupRabbitMq');
const { initializeWebServer } = require('../../src/app');
// Using Dependence Injection For DB and Rabbit Mq for easily testing
async function serverStart() {
	await initializeDatabase();
	const connection = await initializeWebServer();
	await initializeRabbitMQ(RabbitMq);
	return connection;
}

module.exports = serverStart;
