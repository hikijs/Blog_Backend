/* global beforeAll, afterAll, describe, test, expect, 
	beforeEach, afterEach, jest */
const axios = require('axios');
const nock = require('nock');
const { serverStart, serverStop } = require('../mocks/server.mock');
const { ERROR_TYPE_TEST } = require('../mocks/src/router-mock/mock-api/api');
const {
	InternalCode,
	HttpStatus,
} = require('../../src/core/response/responseConfig');
const PREFIX_TEST = '/test';

let axiosAPIClient;
// jest.resetModules();
describe('TEST MULTIPLE RESPONSE TYPE', () => {
	console.log('TESTING: TEST MULTIPLE RESPONSE TYPE');

	beforeAll(async () => {
		console.log('TESTING: beforeAll');
		const apiConnection = await serverStart();
		const axiosConfig = {
			baseURL: `http://127.0.0.1:${apiConnection.port}`,
			validateStatus: () => true, //Don't throw HTTP exceptions. Delegate to the tests to decide which error is acceptable
		};
		axiosAPIClient = axios.create(axiosConfig);

		const hostname = '127.0.0.1';
		// disable all external network
		nock.disableNetConnect();
		// allow only hostname
		nock.enableNetConnect(hostname);

		// Some http clients swallow the "no match" error, so throw here for easy debugging
		nock.emitter.on('no match', (req) => {
			if (req.hostname !== hostname) {
				throw new Error(`Nock no match for: ${req.hostname}`);
			}
		});
		jest.mock('../../src/routers/index', () => {
			return require('../mocks/src/router-mock/index');
		});
	});

	beforeEach(() => {
		console.log('TESTING: beforeEach');
	});

	afterEach(() => {
		console.log('TESTING: afterEach');
	});

	afterAll(() => {
		console.log('TESTING: afterAll');
		serverStop();
	});

	describe('AuthFailureError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.AUTH,
		};
		test('Should Return AuthFailureError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Invalid Credentials',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Invalid Credentials Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Invalid Credentials Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Invalid Credentials',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Invalid Credentials Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Invalid Credentials Custom',
			});
		});
	});

	describe('InternalError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.INTERNAL,
		};
		test('Should Return InternalError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(
				HttpStatus._5xx.INTERNAL_ERROR.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.UNKNOWN,
				message: 'Internal Server Error',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Internal Server Error Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(
				HttpStatus._5xx.INTERNAL_ERROR.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.UNKNOWN,
				message: 'Internal Server Error Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(
				HttpStatus._5xx.INTERNAL_ERROR.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Internal Server Error',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Internal Server Error Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(
				HttpStatus._5xx.INTERNAL_ERROR.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Internal Server Error Custom',
			});

			// Default Error
			const body5 = {
				errorType: ERROR_TYPE_TEST.UNKNOWN,
			};

			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body5);
			expect(response.status).toBe(
				HttpStatus._5xx.INTERNAL_ERROR.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.UNKNOWN,
				message: 'Unknow Reason',
			});
		});
	});

	describe('BadRequestError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.BAD_REQUEST,
		};
		test('Should Return BadRequestError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(
				HttpStatus._4xx.BAD_REQUEST.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.BAD_REQUEST,
				message: 'Bad Request',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Bad Request Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(
				HttpStatus._4xx.BAD_REQUEST.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.BAD_REQUEST,
				message: 'Bad Request Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(
				HttpStatus._4xx.BAD_REQUEST.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Bad Request',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Bad Request Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(
				HttpStatus._4xx.BAD_REQUEST.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Bad Request Custom',
			});
		});
	});

	describe('NotFoundError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.NOT_FOUND,
		};
		test('Should Return NotFoundError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_FOUND,
				message: 'Not Found',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Not Found Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_FOUND,
				message: 'Not Found Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Not Found',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Not Found Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Not Found Custom',
			});

			// not found url
			const body5 = {
				...particalBadRequestBody,
			};
			response = await axiosAPIClient.post('/notfound', body5);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_FOUND,
				message: 'Not Found',
			});
		});
	});

	describe('ForbiddenError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.FORBIDDEN,
		};
		test('Should Return ForbiddenError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(HttpStatus._4xx.FORBIDDEN.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FORBIDDEN,
				message: 'Permission denied',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Permission denied Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(HttpStatus._4xx.FORBIDDEN.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FORBIDDEN,
				message: 'Permission denied Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(HttpStatus._4xx.FORBIDDEN.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Permission denied',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Permission denied Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(HttpStatus._4xx.FORBIDDEN.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Permission denied Custom',
			});
		});
	});

	describe('NoEntryError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.NO_ENTRY,
		};
		test('Should Return NoEntryError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_ENTRY,
				message: 'Entry do not exists',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Entry do not exists Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_ENTRY,
				message: 'Entry do not exists Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Entry do not exists',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Entry do not exists Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Entry do not exists Custom',
			});
		});
	});

	describe('BadTokenError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.BAD_TOKEN,
		};
		test('Should Return BadTokenError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Token is not valid',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Token is not valid Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Token is not valid Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Token is not valid',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Token is not valid Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Token is not valid Custom',
			});
		});
	});

	describe('TokenExpiredError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.TOKEN_EXPIRE,
		};
		test('Should Return TokenExpiredError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Token is expired',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Token is expired Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Token is expired Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Token is expired',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Token is expired Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Token is expired Custom',
			});
		});
	});

	describe('NoDataError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.NO_DATA,
		};
		test('Should Return NoDataError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_ENTRY,
				message: 'No data available',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'No data available Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.NOT_ENTRY,
				message: 'No data available Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'No data available',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'No data available Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(HttpStatus._4xx.NOTFOUND.statusCode);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'No data available Custom',
			});
		});
	});

	describe('AccessTokenError Test Cases', () => {
		const API_TEST_ENDPOINT = PREFIX_TEST + '/responseTest';
		const particalBadRequestBody = {
			errorType: ERROR_TYPE_TEST.ACCESS_TOKEN_ERRROR,
		};
		test('Should Return AccessTokenError', async () => {
			const body1 = {
				...particalBadRequestBody,
			};
			let response = await axiosAPIClient.post(API_TEST_ENDPOINT, body1);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Invalid access token',
			});
			// Custom message
			const body2 = {
				...particalBadRequestBody,
				message: 'Invalid access token Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body2);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.AUTH_FAILURE,
				message: 'Invalid access token Custom',
			});
			// Custom internal code
			const body3 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body3);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Invalid access token',
			});
			// Custom both internal code and message
			const body4 = {
				...particalBadRequestBody,
				internalCode: InternalCode.FAILURE,
				message: 'Invalid access token Custom',
			};
			response = await axiosAPIClient.post(API_TEST_ENDPOINT, body4);
			expect(response.status).toBe(
				HttpStatus._4xx.UNAUTHORIZE.statusCode
			);
			expect(response.data).toMatchObject({
				code: InternalCode.FAILURE,
				message: 'Invalid access token Custom',
			});
		});
	});
});
