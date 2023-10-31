const HttpStatus = {
	_2xx: {
		OK: {
			statusCode: 200,
			reason: 'Success',
		},
		CREATED: {
			statusCode: 201,
			reason: 'Created',
		},
		NO_CONTEND: {
			statusCode: 204,
			reason: 'No Content',
		},
		PARTICAL_CONTENT: {
			code: 206,
			reason: 'Particial Content',
		},
	},
	_3xx: {
		REDIRECT: {
			statusCode: 302,
			reason: 'Found',
		},
	},
	_4xx: {
		BAD_REQUEST: {
			statusCode: 400,
			reason: 'Bad Request',
		},
		UNAUTHORIZE: {
			statusCode: 401,
			reason: 'Unauthorized',
		},
		FORBIDDEN: {
			statusCode: 403,
			reason: 'Forbidden',
		},
		NOTFOUND: {
			statusCode: 404,
			reason: 'Not Found',
		},
	},
	_5xx: {
		INTERNAL_ERROR: {
			statusCode: 500,
			reason: 'Internal Server Error',
		},
	},
};

const InternalCode = {
	SUCCESS: 10001,
	FAILURE: 10002,
	AUTH_FAILURE: 10003,
	BAD_REQUEST: 10004,
	NOT_FOUND: 10005,
	NOT_ENTRY: 10006,
	UNKNOWN: 10007,
	FORBIDDEN: 10008,
};

module.exports = { HttpStatus, InternalCode };
