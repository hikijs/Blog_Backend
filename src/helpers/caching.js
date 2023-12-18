const RedisInstance = require('../caching/init.redis');
const Cache = async (key, serviceFnc) => {
	const redisInstance = RedisInstance.getInstance();
	let metaData = await redisInstance.getData(key, { json: true });
	console.log(metaData);
	if (metaData == null) {
		console.log('Redis Data: Miss Cache');
		metaData = await serviceFnc();
		if (await redisInstance.setData(key, metaData, { json: true })) {
			console.log('Redis set data done');
		}
	} else {
		console.log('Redis Data: Hit Cache');
	}
	return metaData;
};
module.exports = Cache;
