'use strict';
const { ApiResponseBase } = require('./apiResponseBase');
const { InternalCode, HttpStatus } = require('./responseConfig');

class SuccessResponse extends ApiResponseBase {
	constructor({
		statusCode,
		internalCode = InternalCode.SUCCESS,
		message,
		metaData = {},
	}) {
		super({ statusCode, internalCode, message, metaData });
	}

	redirectToOauthPage(res) {
		const { oauthUrl } = this.metaData;
		res.redirect(this.status, oauthUrl);
	}

	redirectToFrontEnd(res) {
		const feUrl = 'http://localhost:3001';
		res.redirect(this.status, feUrl);
	}

	sendFile(res, filename) {
		return res.sendFile(filename);
	}
}

class OK extends SuccessResponse {
	constructor({
		message = null,
		metaData,
		internalCode = InternalCode.SUCCESS,
	}) {
		const { statusCode, reason } = HttpStatus._2xx.OK;
		if (!message) {
			message = reason;
		}
		super({ statusCode, internalCode, message, metaData });
	}
}

class CREATED extends SuccessResponse {
	constructor({
		message = null,
		metaData,
		internalCode = InternalCode.SUCCESS,
	}) {
		const { statusCode, reason } = HttpStatus._2xx.CREATED;
		if (!message) {
			message = reason;
		}
		super({ statusCode, internalCode, message, metaData });
	}
}
class REDIRECT extends SuccessResponse {
	constructor({
		message = null,
		metaData,
		internalCode = InternalCode.SUCCESS,
	}) {
		const { statusCode, reason } = HttpStatus._2xx.REDIRECT;
		if (!message) {
			message = reason;
		}
		super({ statusCode, internalCode, message, metaData });
	}
}

module.exports = {
	OK,
	CREATED,
	REDIRECT,
};
