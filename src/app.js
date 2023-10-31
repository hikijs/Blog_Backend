const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const helmet = require('helmet');
const compress = require('compression');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');
const { ApiError, NotFoundError } = require('./core/error.response');
require('dotenv').config();

// eslint-disable-next-line no-undef
console.info(`===== Enviroment of Node is ${process.env.NODE_ENV} =====`);
//A. init middeware
// allow all site can access the API
let connection;
const initializeWebServer = () => {
	console.time('>>> Start Application');
	return new Promise((resolve, reject) => {
		try {
			app.use(
				cors({
					origin: [
						'https://blog.hunghoang.online',
						'http://localhost:3000',
						'http://localhost:3001',
					],
					credentials: true,
				})
			);
			// parse cookie
			app.use(cookieParser());
			// logging for server using morgan has 5 types (dev, combined, common, short, tiny)
			app.use(morgan('common'));
			// helmet for protect info package http
			// that helping CROS attack, so if test in local please comment it
			// app.use(helmet())
			// compression reduce the size of package
			app.use(compress());

			app.use(express.json());
			app.use(express.urlencoded({ extends: true }));

			//C. init handle error
			// eslint-disable-next-line no-undef
			app.use(express.static(path.join(__dirname, '..', 'uploads')));
			//init routes
			const router = require('./routers');
			app.use(router);

			// handling error
			app.use((req, res, next) => {
				const error = new NotFoundError({});
				next(error);
			});

			// eslint-disable-next-line no-unused-vars
			app.use((error, req, res, next) => {
				// The error was handle by ApiError class
				console.error(error);
				ApiError.handleError(error, res);
			});
			// eslint-disable-next-line no-undef
			const PORT = process.env.PORT || 3000;
			connection = app.listen(PORT, () => {
				console.log(`Application is listen on port ${PORT}`);
				console.timeEnd('>>>>> Start Application');
				resolve(connection.address());
			});
		} catch (error) {
			console.error(error);
			console.timeEnd('>>>>> Start Application');
			reject(null);
		}
	});
};

const stopWebServer = () => {
	return new Promise((resolve, reject) => {
		connection.close((err) => {
			if (err) {
				console.error('Error Happen When Close Connection Http Server');
				reject();
			}
			resolve();
		});
	});
};

module.exports = {
	initializeWebServer,
	stopWebServer,
};
