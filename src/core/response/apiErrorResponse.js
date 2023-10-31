'use strict';
const { ApiResponseBase } = require('./apiResponseBase');
const { InternalCode, HttpStatus } = require('./responseConfig');

class ErrorResponse extends ApiResponseBase {
	constructor(statusCode, internalCode, message) {
		super({
			statusCode,
			internalCode,
			message,
			succcessRes: false,
		});
	}
}

class BadRequestResponse extends ErrorResponse {
	constructor(message = null, internalCode = InternalCode.FAILURE) {
		const { statusCode, reason } = HttpStatus._4xx.BAD_REQUEST;
		if (!message) {
			message = reason;
		}
		super(statusCode, internalCode, message);
	}
}

class AuthenticateErrorResponse extends ErrorResponse {
	constructor(message = null, internalCode = InternalCode.FAILURE) {
		const { statusCode, reason } = HttpStatus._4xx.UNAUTHORIZE;
		if (!message) {
			message = reason;
		}
		super(statusCode, internalCode, message);
	}
}

class ForbiddenResponse extends ErrorResponse {
	constructor(message = null, internalCode = InternalCode.FAILURE) {
		const { statusCode, reason } = HttpStatus._4xx.FORBIDDEN;
		if (!message) {
			message = reason;
		}
		super(statusCode, internalCode, message);
	}
}

class NotFoundResponse extends ErrorResponse {
	constructor(message = null, internalCode = InternalCode.FAILURE) {
		const { statusCode, reason } = HttpStatus._4xx.NOTFOUND;
		if (!message) {
			message = reason;
		}
		super(statusCode, internalCode, message);
	}
}

class InteralServerErrorResponse extends ErrorResponse {
	constructor(message = null, internalCode = InternalCode.FAILURE) {
		const { statusCode, reason } = HttpStatus._5xx.INTERNAL_ERROR;
		if (!message) {
			message = reason;
		}
		super(statusCode, internalCode, message);
	}
}

module.exports = {
	BadRequestResponse,
	AuthenticateErrorResponse,
	ForbiddenResponse,
	NotFoundResponse,
	InteralServerErrorResponse,
};
