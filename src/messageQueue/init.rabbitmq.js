const amqplib = require('amqplib');
require('dotenv').config();
// eslint-disable-next-line no-undef
const rabbitmqConnectStr = process.env.RABBIT_CONNECTION_URL;

class RabbitMq {
	static instances = {}; // the object of instance, in the future might be we have many type of instances
	constructor() {
		this.connection = null;
		this.channel = null;
		this.exchange = null;
		this.queue = null;
	}

	static async getInstance(exchangeName) {
		if (!RabbitMq.instances[exchangeName]) {
			RabbitMq.instances[exchangeName] = new RabbitMq();
			await RabbitMq.instances[exchangeName].connect(
				rabbitmqConnectStr,
				exchangeName
			);
		}
		return RabbitMq.instances[exchangeName];
	}

	async connect(connectStr, exchangeName, typeExchange = 'direct') {
		this.connection = await amqplib.connect(connectStr);
		this.channel = await this.connection.createChannel();
		this.exchange = await this.channel.assertExchange(
			exchangeName,
			typeExchange,
			{
				durable: false,
			}
		);
		console.log('Successfull set up connection to rabbit mq');
	}

	async publishObject(messageObject, queueName) {
		const messageStr = JSON.stringify(messageObject);
		this.publishString(messageStr, queueName);
	}

	async publishString(messageStr, queueName) {
		console.log(
			`DEBUG: publish message: ${messageStr} to queue ${queueName}`
		);
		this.channel.publish(
			this.exchange?.exchange,
			queueName,
			Buffer.from(messageStr) // eslint-disable-line no-undef
		);
	}
}

module.exports = RabbitMq;
