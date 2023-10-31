'use strict';

const {
	BadRequestResponse,
	AuthenticateErrorResponse,
	ForbiddenResponse,
	NotFoundResponse,
	InteralServerErrorResponse,
} = require('./response/apiErrorResponse');

const { InternalCode } = require('./response/responseConfig');

const ERROR_TYPE = {
	BAD_TOKEN: 'BadTokenError',
	TOKEN_EXPIRED: 'TokenExpiredError',
	UNAUTHORIZED: 'AuthFailureError',
	ACCESS_TOKEN: 'AccessTokenError',
	INTERNAL: 'InternalError',
	NOT_FOUND: 'NotFoundError',
	NO_ENTRY: 'NoEntryError',
	NO_DATA: 'NoDataError',
	BAD_REQUEST: 'BadRequestError',
	FORBIDDEN: 'ForbiddenError',
};

class ApiError extends Error {
	constructor(errorType, internalCode, message = null) {
		super(message);
		this.type = errorType;
		this.internalCode = internalCode;
	}

	getType() {
		return this.type;
	}

	// factory pattern
	static handleError(apiError, res) {
		if (!(apiError instanceof ApiError)) {
			apiError = new InternalError({
				message: apiError.message,
				internalCode: InternalCode.UNKNOWN,
			});
		}
		const { message, internalCode } = apiError;
		switch (apiError.getType()) {
			case ERROR_TYPE.BAD_TOKEN:
			case ERROR_TYPE.TOKEN_EXPIRED:
			case ERROR_TYPE.UNAUTHORIZED:
			case ERROR_TYPE.ACCESS_TOKEN: {
				return new AuthenticateErrorResponse(
					message,
					internalCode
				).send(res);
			}
			case ERROR_TYPE.INTERNAL: {
				return new InteralServerErrorResponse(
					message,
					internalCode
				).send(res);
			}
			case ERROR_TYPE.NOT_FOUND:
			case ERROR_TYPE.NO_ENTRY:
			case ERROR_TYPE.NO_DATA: {
				return new NotFoundResponse(message, internalCode).send(res);
			}
			case ERROR_TYPE.BAD_REQUEST: {
				return new BadRequestResponse(message, internalCode).send(res);
			}
			case ERROR_TYPE.FORBIDDEN: {
				return new ForbiddenResponse(message, internalCode).send(res);
			}
			default: {
				return new InteralServerErrorResponse(
					'Race Condition',
					InternalCode.UNKNOWN
				).send(res);
			}
		}
	}
}

class AuthFailureError extends ApiError {
	constructor({
		message = 'Invalid Credentials',
		internalCode = InternalCode.AUTH_FAILURE,
	}) {
		super(ERROR_TYPE.UNAUTHORIZED, internalCode, message);
	}
}

class InternalError extends ApiError {
	constructor({
		message = 'Internal Server Error',
		internalCode = InternalCode.UNKNOWN,
	}) {
		super(ERROR_TYPE.INTERNAL, internalCode, message);
	}
}

class BadRequestError extends ApiError {
	constructor({
		message = 'Bad Request',
		internalCode = InternalCode.BAD_REQUEST,
	}) {
		super(ERROR_TYPE.BAD_REQUEST, internalCode, message);
	}
}

class NotFoundError extends ApiError {
	constructor({
		message = 'Not Found',
		internalCode = InternalCode.NOT_FOUND,
	}) {
		super(ERROR_TYPE.NOT_FOUND, internalCode, message);
	}
}

class ForbiddenError extends ApiError {
	constructor({
		message = 'Permission denied',
		internalCode = InternalCode.FORBIDDEN,
	}) {
		super(ERROR_TYPE.FORBIDDEN, internalCode, message);
	}
}

class NoEntryError extends ApiError {
	constructor({
		message = 'Entry do not exists',
		internalCode = InternalCode.NOT_ENTRY,
	}) {
		super(ERROR_TYPE.NO_ENTRY, internalCode, message);
	}
}

class BadTokenError extends ApiError {
	constructor({
		message = 'Token is not valid',
		internalCode = InternalCode.AUTH_FAILURE,
	}) {
		super(ERROR_TYPE.BAD_TOKEN, internalCode, message);
	}
}

class TokenExpiredError extends ApiError {
	constructor({
		message = 'Token is expired',
		internalCode = InternalCode.AUTH_FAILURE,
	}) {
		super(ERROR_TYPE.TOKEN_EXPIRED, internalCode, message);
	}
}

class NoDataError extends ApiError {
	constructor({
		message = 'No data available',
		internalCode = InternalCode.NOT_ENTRY,
	}) {
		super(ERROR_TYPE.NO_DATA, internalCode, message);
	}
}

class AccessTokenError extends ApiError {
	constructor({
		message = 'Invalid access token',
		internalCode = InternalCode.AUTH_FAILURE,
	}) {
		super(ERROR_TYPE.ACCESS_TOKEN, internalCode, message);
	}
}

module.exports = {
	ERROR_TYPE,
	ApiError,
	AuthFailureError,
	InternalError,
	BadRequestError,
	NotFoundError,
	ForbiddenError,
	NoEntryError,
	BadTokenError,
	TokenExpiredError,
	NoDataError,
	AccessTokenError,
};
