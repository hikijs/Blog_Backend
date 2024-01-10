const RabbitMq = require('../../src/messageQueue/setupRabbitMq');
const {
	initializeDatabase,
	releaseDatabaseConnection,
} = require('../../src/dbs/setupDatabase');
const initializeRabbitMQ = require('../../src/messageQueue/setupRabbitMq');
const { initializeWebServer, stopWebServer } = require('../../src/app');
// Using Dependence Injection For DB and Rabbit Mq for easily testing
async function serverStart() {
	console.log('===>  SETUP SERVER TEST ENVIRONMENT <===');
	await initializeDatabase();
	const connection = await initializeWebServer();
	await initializeRabbitMQ(RabbitMq);
	return connection;
}

async function serverStop() {
	await releaseDatabaseConnection();
	await stopWebServer();
}

module.exports = { serverStart, serverStop };
