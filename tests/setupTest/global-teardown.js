const isCI = require('is-ci');
const dockerCompose = require('docker-compose');
// const path = require('path');
// const { execSync } = require('child_process');

module.exports = async () => {
	if (isCI) {
		console.log('down compose');
		// ️️️✅ Best Practice: Leave the DB up in dev environment
		dockerCompose.down();
	} else {
		console.log('do noting compose');
		// TODO the teardown process does not good till know, can not call script
		// const dbScript = path.join(__dirname, '..', '..') + '/db_manage.sh'
		// console.log(dbScript)
		// execSync(`${dbScript} -t -c`);
	}
};
