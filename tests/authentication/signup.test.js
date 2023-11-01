/* global beforeAll, afterAll, describe, test, expect, beforeEach, afterEach */
const axios = require('axios');
const nock = require('nock');
const { serverStart, serverStop } = require('../mocks/server.mock');
const UserQuery = require('../../src/dbs/user.mysql');
const { CONFIGS } = require('../config/config');

// regulare express for public key is heximal string with length is 128
const PUBLICKEY_REGEX = /^[0-9a-fA-F]{128}$/;
// Use a regular expression to check if valid JWT token
const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
let axiosAPIClient;
beforeAll(async () => {
	const apiConnection = await serverStart();
	const axiosConfig = {
		baseURL: `http://127.0.0.1:${apiConnection.port}`,
		validateStatus: () => true, //Don't throw HTTP exceptions. Delegate to the tests to decide which error is acceptable
	};
	axiosAPIClient = axios.create(axiosConfig);

	const hostname = CONFIGS.hostname;
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
});

afterAll(() => {
	serverStop();
});

describe('APIs Authentication Basic', () => {
	const correctUsers = {
		user1: {
			username: 'viethung',
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		user2: {
			username: 'Hoàng Việt Hưng',
			email: 'viethun23g@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
	};
	const validateKeyBody = {
		incorrectUserName: {
			userName: 'viethung',
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		incorrectEmail: {
			username: 'viethung',
			Email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		incorrectPassword: {
			username: 'quocthang',
			email: 'quocthang@gmail.com',
			Password: '1235',
			birth: '1999-09-14',
		},
		incorrectBirth: {
			username: 'quocthang',
			email: 'quocthang@gmail.com',
			Password: '1235',
			birthDay: '1999-09-14',
		},
	};

	const ValidateMissingKey = {
		missUsername: {
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		missEmail: {
			username: 'quocthang',
			password: '1235',
			birth: '1999-09-14',
		},
		missPassword: {
			username: 'quocthang',
			email: 'quocthang@gmail.com',
			birth: '1999-09-14',
		},
		missBirth: {
			username: 'quocthang',
			email: 'quocthang@gmail.com',
			Password: '1235',
		},
	};

	const ValidateUserName = {
		shortUserName1: {
			username: 'hung', // 4 characters
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		shortUserName2: {
			username: 'hunghoa', // 7 characters
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		shortUserName3: {
			username: '', // 0 characters
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		longUserName1: {
			username: 'luffycantakeonepieceinthefutureandilikeluffy', // 44 characters
			email: 'viethung@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		longUserName2: {
			username: 'abcdeabcdeabcdeabcdeabcdeabcdef', // 31 characters
			email: 'abcded@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		formatUserName1: {
			username: 'hunghoang#',
			email: 'hunghoang@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		formatUserName2: {
			username: 'Hunghoang@',
			email: 'hunghoang@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
		formatUserName3: {
			username: 'Việt 1 @',
			email: 'hunghoang1@gmail.com',
			password: '1235',
			birth: '1999-09-14',
		},
	};

	beforeEach(async () => {});

	afterEach(async () => {});

	// STARTING TESTCASE
	const API_SIGNUP_ENDPOINT = CONFIGS.apiUrls.SIGNUP;

	describe(`Validate Keys In Body Of SignUp Request ${API_SIGNUP_ENDPOINT}`, () => {
		test('400 username but Username', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				validateKeyBody.incorrectUserName
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'username is required',
			});
		});
		test('400 email but Email', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				validateKeyBody.incorrectEmail
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'email is required',
			});
		});
		test('400 password but Password', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				validateKeyBody.incorrectPassword
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'password is required',
			});
		});

		test('400 birth but birthDay', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				validateKeyBody.incorrectBirth
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'birth is required',
			});
		});
	});

	describe(`Validate Missing Keys In Body Of SignUp Request ${API_SIGNUP_ENDPOINT}`, () => {
		test('400 missing username', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateMissingKey.missUsername
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'username is required',
			});
		});
		test('400 missing email', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateMissingKey.missEmail
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'email is required',
			});
		});
		test('400 missing password', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateMissingKey.missPassword
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'password is required',
			});
		});

		test('400 missing birth', async () => {
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateMissingKey.missBirth
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'birth is required',
			});
		});
	});

	describe(`Validate UserName ${API_SIGNUP_ENDPOINT}`, () => {
		test('400 Short username', async () => {
			let response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.shortUserName1
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'username length must be at least 8 characters long',
			});

			response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.shortUserName2
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'username length must be at least 8 characters long',
			});

			response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.shortUserName3
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message: 'username is not allowed to be empty',
			});
		});

		test('400 Long username', async () => {
			let response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.longUserName1
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message:
					'username length must be less than or equal to 30 characters long',
			});
			response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.longUserName2
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message:
					'username length must be less than or equal to 30 characters long',
			});
		});

		test('400 Format username', async () => {
			let response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.formatUserName1
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message:
					'Username should only contain letters and numbers and spaces',
			});
			response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.formatUserName2
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message:
					'Username should only contain letters and numbers and spaces',
			});
			response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				ValidateUserName.formatUserName3
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data).toMatchObject({
				code: 10004,
				message:
					'Username should only contain letters and numbers and spaces',
			});
		});
	});

	describe('Correct User', () => {
		test('Register Success For User1', async () => {
			// username -> Username
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				correctUsers.user1
			);
			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
			const { message, metaData } = response.data;
			expect(message).toEqual('Registered Success!');
			expect(metaData.newUserId).toHaveLength(36);
			const { newTokens } = metaData;
			const { publicKey, accessKey, refreshKey } = newTokens;
			expect(publicKey).toMatch(PUBLICKEY_REGEX);
			expect(accessKey).toMatch(JWT_REGEX);
			expect(refreshKey).toMatch(JWT_REGEX);
		});

		test('Register Success For User2', async () => {
			// username -> Username
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				correctUsers.user2
			);
			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
			const { message, metaData } = response.data;
			expect(message).toEqual('Registered Success!');
			expect(metaData.newUserId).toHaveLength(36);
			const { newTokens } = metaData;
			const { publicKey, accessKey, refreshKey } = newTokens;
			expect(publicKey).toMatch(PUBLICKEY_REGEX);
			expect(accessKey).toMatch(JWT_REGEX);
			expect(refreshKey).toMatch(JWT_REGEX);
		});
		beforeAll(async () => {
			await UserQuery.deleteUserByUserName(correctUsers.user1.username);
			await UserQuery.deleteUserByUserName(correctUsers.user2.username);
		});
		// clean correct user after finish
		afterAll(async () => {
			await UserQuery.deleteUserByUserName(correctUsers.user1.username);
			await UserQuery.deleteUserByUserName(correctUsers.user2.username);
		});
	});
});
