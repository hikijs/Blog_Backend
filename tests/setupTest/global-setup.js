const isPortReachable = require('is-port-reachable');
const path = require('path');
const dockerCompose = require('docker-compose');
const { execSync } = require('child_process');
require('dotenv').config();

module.exports = async () => {
	// eslint-disable-next-line no-undef
	const currentDir = __dirname;
	console.time('global-setup');

	// eslint-disable-next-line no-undef
	const isDBReachable = await isPortReachable(process.env.MYSQL_PORT || 3308); //port mysql test
	if (!isDBReachable) {
		// ️️️✅ Best Practice: Start the infrastructure within a test hook - No failures occur because the DB is down
		// console.log("start docker compose")
		await dockerCompose.upAll({
			cwd: path.join(currentDir),
			log: true,
		});
		const dbScript = path.join(currentDir, '..', '..') + '/db_manage.sh';
		console.log(dbScript);
		execSync(`${dbScript} -s -t`);
	}
	console.log(path.join(currentDir));
	// 👍🏼 We're ready
	console.timeEnd('global-setup');
};
