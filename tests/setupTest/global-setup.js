const path = require('path');
const dockerCompose = require('docker-compose');
const { execSync } = require('child_process');
// eslint-disable-next-line no-undef
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const { initializeDatabase } = require('../../src/dbs/setupDatabase');
const Docker = require('dockerode');

async function followLogsMysql() {
	return new Promise((resolve, reject) => {
		// Create a Docker instance
		const docker = new Docker();
		// Get the container by name
		const container = docker.getContainer('mysql_test');
		
		// Stream logs from the container in real-time
		container.logs({
			follow: true,
			stdout: true,
			stderr: true
		}, (err, stream) => {
			let counter = 60;
			const timeout = setInterval(() => {
				counter--;
				if (counter === 0) {
					clearInterval(timeout);
					reject('Set up db time out');
				}
			}, 1000);

			if (err) {
				console.error('Error streaming logs:', err.message);
				clearInterval(timeout); // Clear the timeout if there is an error
				reject(err);
				return;
			}

			// Handle log data
			stream.on('data', (data) => {
				const log = data.toString('utf8');
				console.log(log);
				if (log.includes('ready for connections')) {
					clearInterval(timeout); // Clear the timeout if the condition is met
					stream.destroy(); // stop following the logs
					resolve();
				}
			});

			// Handle stream closure
			stream.on('end', () => {
				console.log('Log stream mysql2 closed.');
			});

			// Handle stream error
			stream.on('error', (error) => {
				console.error('Error in log stream:', error.message);
				clearInterval(timeout); // Clear the timeout if there is an error
				reject(error);
			});
		});
	});
}

async function followLogsRabbitMq() {
	return new Promise((resolve, reject) => {
		// Create a Docker instance
		const docker = new Docker();
		// Get the container by name
		const container = docker.getContainer('rabbitmq_test');
		
		// Stream logs from the container in real-time
		container.logs({
			follow: true,
			stdout: true,
			stderr: true
		}, (err, stream) => {
			let counter = 60;
			const timeout = setInterval(() => {
				counter--;
				if (counter === 0) {
					clearInterval(timeout);
					reject('Set up rabbitmq time out');
				}
			}, 1000);

			if (err) {
				console.error('Error streaming logs:', err.message);
				clearInterval(timeout); // Clear the timeout if there is an error
				reject(err);
				return;
			}

			// Handle log data
			stream.on('data', (data) => {
				const log = data.toString('utf8');
				console.log(log);
				if (log.includes('Server startup complete')) {
					clearInterval(timeout); // Clear the timeout if the condition is met
					stream.destroy(); // stop following the logs
					resolve();
				}
			});

			// Handle stream closure
			stream.on('end', () => {
				console.log('Log stream rabbitmq closed.');
			});

			// Handle stream error
			stream.on('error', (error) => {
				console.error('Error in log stream:', error.message);
				clearInterval(timeout); // Clear the timeout if there is an error
				reject(error);
			});
		});
	});
}

async function isDbCanConnect() {
	return new Promise((resolve, reject) => {
		let cnt = 10;
		const checkConnectInterval = setInterval(async () => {
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

function isDockerComposeRunning() {
	try {
		execSync('docker ps | grep "mysql_test\\|rabbitmq_test\\|utils_test\\|phpmyadmin_test"');
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = async () => {
	console.log('===>  SET UP TEST ENVIRONMENT <===');
	// eslint-disable-next-line no-undef
	const currentDir = __dirname;
	try {
		if (isDockerComposeRunning()) {
			await dockerCompose.down({
				cwd: path.join(currentDir),
				log: true,
			});
		}
		// ️️️✅ Best Practice: Start the infrastructure within a test hook - No failures occur because the DB is down
		await dockerCompose.upAll({
			cwd: path.join(currentDir),
			log: true,
		});
	} catch (error) {
		console.error(`!! Can not start docker compose ${error}`);
		throw new Error(error);
	}
	
	try {
		await followLogsMysql();
		await followLogsRabbitMq();
		await isDbCanConnect();
		const dbScript = path.join(currentDir, '..', '..') + '/db_manage.sh';
		execSync(`${dbScript} -s -t`);
	} catch (error) {
		console.error(`!! Can not connect DB ${error}`);
		throw new Error(error);
	}
};
