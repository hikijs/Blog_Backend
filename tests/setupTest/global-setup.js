const isPortReachable = require('is-port-reachable');
const path = require('path');
const dockerCompose = require('docker-compose');
const { execSync } = require('child_process');
// eslint-disable-next-line no-undef
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const { initializeDatabase } = require('../../src/dbs/setupDatabase');

async function isDbCanConnect() {
	return new Promise((resolve, reject) => {
		let cnt = 10;
		const checkConnectInterval = setInterval(async () => {
			console.log('>>> Checking Db Can Be Connect To $$$$');
			if (cnt == 0) {
				clearInterval(checkConnectInterval);
				reject();
			}
			try {
				await initializeDatabase();
				clearInterval(checkConnectInterval);
				resolve();
			} catch (error) {
				cnt--;
			}
		}, 1000);
	});
}
module.exports = async () => {
	// eslint-disable-next-line no-undef
	const currentDir = __dirname;
	console.time('global-setup');

	// eslint-disable-next-line no-undef
	const isDBReachable = await isPortReachable(3008); //port mysql test
	if (!isDBReachable) {
		// ️️️✅ Best Practice: Start the infrastructure within a test hook - No failures occur because the DB is down
		// console.log("start docker compose")
		await dockerCompose.upAll({
			cwd: path.join(currentDir),
			log: true,
		});
	}
	try {
		await isDbCanConnect();
		const dbScript = path.join(currentDir, '..', '..') + '/db_manage.sh';
		execSync(`${dbScript} -s -t`);
		console.log(dbScript);

		console.log(path.join(currentDir));
		console.timeEnd('global-setup');
	} catch (error) {
		console.error(`DB CAN NOT CONNECT ${error}`);
		throw new Error(error);
	}
};
