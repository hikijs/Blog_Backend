const { createClient } = require('redis');
require('dotenv').config();

// eslint-disable-next-line no-undef
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const HOST = REDIS_HOST || '127.0.0.1';
const PORT = REDIS_PORT || '6379';
const PASSWORD = REDIS_PASSWORD || 'password';

class RedisInstance {
	constructor() {
		this.redisUrl = `redis://:${PASSWORD}@${HOST}:${PORT}`;
		console.log('Redis Url', this.redisUrl);
	}

	static getInstance() {
		if (!RedisInstance.instance) {
			RedisInstance.instance = new RedisInstance();
		}
		return RedisInstance.instance;
	}

	async createClient() {
		const paramsRedis = {
			// template redis[s]://[[username][:password]@][host][:port][/db-number]
			url: this.redisUrl,
			socket: {
				reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
			},
		};
		this.client = createClient(paramsRedis);
		this.handlingEvent();
		await this.client.connect();
	}

	handlingEvent() {
		if (this.client) {
			this.client.on('connect', () => {
				console.log('Redis Event: connect Client Connected');
			});

			this.client.on('ready', () => {
				console.log('Redis Event: ready Client Ready');
			});

			this.client.on('reconnecting', () => {
				console.log(
					'Redis Event: reconnecting Client Try To Re-Connecting'
				);
			});

			this.client.on('end', () => {
				console.log('Redis Event: end Connection to Redis closed');
			});

			this.client.on('error', (err) => {
				console.log('Redis Event: Error Client Ready', err);
			});
		}
	}

	async closeConnection() {
		if (this.client) {
			await this.client.quit(() => {
				console.log('Redis connection closed');
			});
		}
	}

	async setData(
		key,
		str,
		opts = {
			json: false,
		}
	) {
		try {
			if (opts.json) {
				str = JSON.stringify(str);
			}

			if (this.client && this.client.isReady) {
				const ttl = 20;
				await this.client.set(key, str, {
					EX: ttl,
					NX: true,
				});
				return true;
			}
			return false;
		} catch (error) {
			console.log(`Set Data To Redis Failure ${error}`);
			return null;
		}
	}

	async getData(
		key,
		opts = {
			json: false,
		}
	) {
		try {
			if (this.client && this.client.isReady) {
				const data = await this.client.get(key);
				if (data && opts.json) {
					return JSON.parse(data);
				}
				return data;
			}
		} catch (error) {
			console.log(`Get Data From Redis Failure ${error}`);
			return null;
		}
	}
}

module.exports = RedisInstance;
