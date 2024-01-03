const isCI = require('is-ci');
const dockerCompose = require('docker-compose');
const path = require('path');
// const { execSync } = require('child_process');
async function tearDownAllContainers() {
	const currentDir = __dirname;
	return dockerCompose.down({
		cwd: path.join(currentDir),
		log: true,
	});
}

module.exports = async () => {
	console.log('===>  TEAR DOWN TEST ENVIRONMENT <===');
	if (isCI) { // when using github action, jenkins, circleci, ...
		await tearDownAllContainers();
	} else {
		await tearDownAllContainers();
		// TODO the teardown process does not good till know, can not call script
		// const dbScript = path.join(__dirname, '..', '..') + '/db_manage.sh'
		// console.log(dbScript)
		// execSync(`${dbScript} -t -c`);
	}
};
