const RabbitMq = require('./src/messageQueue/setupRabbitMq');
require('dotenv').config();
const {
	initializeDatabase,
	releaseDatabaseConnection,
} = require('./src/dbs/setupDatabase');
const initializeRabbitMQ = require('./src/messageQueue/setupRabbitMq');
const { initializeWebServer } = require('./src/app');
// Using Dependence Injection For DB and Rabbit Mq for easily testing
async function start() {
	console.time('>>> Start WebServer');
	await initializeDatabase();
	await initializeWebServer();
	await initializeRabbitMQ(RabbitMq);
	console.timeEnd('>>> Start WebServer');
}

start()
	.then(() => {
		console.log('The app has started successfully');
	})
	.catch((error) => {
		releaseDatabaseConnection();
		console.log('App occured during startup', error);
	});
