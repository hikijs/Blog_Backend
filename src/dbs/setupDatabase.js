const initializeDatabase = async () => {
	const Database = require('./init.mysql');
	console.time('>>> DB setup');
	const dbInstance = Database.getInstance();
	try {
		const query = 'SELECT 1';
		const result = await dbInstance.hitQuery(query, []);
		if (result.length > 0 && result[0]['1'] == 1) {
			console.log('Connection to Mysql Establish Successfully');
		} else {
			throw new Error(
				'Connection to Mysql Establish Failure Please Check Log'
			);
		}
	} catch (error) {
		console.log('Connection to Mysql Establish Failure');
		console.timeEnd('>>> DB setup');
		throw new Error(error);
	}
	console.timeEnd('>>> DB setup');
};

const releaseDatabaseConnection = async () => {
	const Database = require('./init.mysql');
	console.time('>>> release DB connection');
	const dbInstance = Database.isExistInstance();
	if (dbInstance) {
		dbInstance.releaseAllConnection();
	}
	console.timeEnd('>>> release DB connection');
};

module.exports = { initializeDatabase, releaseDatabaseConnection };
