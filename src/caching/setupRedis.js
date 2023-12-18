const initializeRedisCache = async () => {
	const RedisInstance = require('./init.redis');
	console.time('>>> Redis setup');
	const redisInstance = RedisInstance.getInstance();
	try {
		await redisInstance.createClient();
		console.log('Connection to Redis Db Successfully');
	} catch (error) {
		console.log('Connection to Redis Db Failure');
		throw new Error(error);
	}

	console.timeEnd('>>> Redis setup');
};

const releaseRedisConnection = async () => {
	const RedisInstance = require('./init.redis');
	const redisInstance = RedisInstance.getInstance();
	if (redisInstance) {
		console.time('>>> release Redis connection');
		await redisInstance.closeConnection();
		console.timeEnd('>>> release Redis connection');
	}
};

module.exports = { initializeRedisCache, releaseRedisConnection };
