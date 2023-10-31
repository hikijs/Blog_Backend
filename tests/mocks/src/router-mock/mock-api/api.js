'use strict';
const express = require('express');
const router = express.Router();
const { asyncHanlder } = require('../../../../../src/helpers/asyncHandler');
const {
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
} = require('../../../../../src/core/error.response');
require('dotenv').config();

const ERROR_TYPE_TEST = {
	AUTH: 0,
	INTERNAL: 1,
	BAD_REQUEST: 2,
	NOT_FOUND: 3,
	FORBIDDEN: 4,
	NO_ENTRY: 5,
	BAD_TOKEN: 6,
	TOKEN_EXPIRE: 7,
	NO_DATA: 8,
	ACCESS_TOKEN_ERRROR: 9,
	UNKNOWN: 10,
};

function createError(func, message, internalCode) {
	if (message && internalCode) {
		return new func({ message, internalCode });
	} else if (message) {
		return new func({ message });
	} else if (internalCode) {
		return new func({ internalCode });
	} else {
		return new func({});
	}
}

function throwErrorFactory(errType, message, internalCode) {
	switch (errType) {
		case ERROR_TYPE_TEST.AUTH:
			throw createError(AuthFailureError, message, internalCode);
		case ERROR_TYPE_TEST.INTERNAL:
			throw createError(InternalError, message, internalCode);
		case ERROR_TYPE_TEST.BAD_REQUEST:
			throw createError(BadRequestError, message, internalCode);
		case ERROR_TYPE_TEST.NOT_FOUND:
			throw createError(NotFoundError, message, internalCode);
		case ERROR_TYPE_TEST.FORBIDDEN:
			throw createError(ForbiddenError, message, internalCode);
		case ERROR_TYPE_TEST.NO_ENTRY:
			throw createError(NoEntryError, message, internalCode);
		case ERROR_TYPE_TEST.BAD_TOKEN:
			throw createError(BadTokenError, message, internalCode);
		case ERROR_TYPE_TEST.TOKEN_EXPIRE:
			throw createError(TokenExpiredError, message, internalCode);
		case ERROR_TYPE_TEST.NO_DATA:
			throw createError(NoDataError, message, internalCode);
		case ERROR_TYPE_TEST.ACCESS_TOKEN_ERRROR:
			throw createError(AccessTokenError, message, internalCode);
		case ERROR_TYPE_TEST.UNKNOWN:
			throw new Error('Unknow Reason');
	}
}

router.post(
	'/responseTest',
	asyncHanlder(
		// eslint-disable-next-line no-unused-vars
		(req, res, next) => {
			const { errorType, message, internalCode } = req.body;
			throwErrorFactory(errorType, message, internalCode);
		}
	)
);

module.exports = router;
module.exports.ERROR_TYPE_TEST = ERROR_TYPE_TEST;
