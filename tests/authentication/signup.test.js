/* global beforeAll, afterAll, describe, test, expect */
const axios = require('axios');
const nock = require('nock');
const { serverStart, serverStop } = require('../mocks/server.mock');
const Database = require('../../src/dbs/init.mysql');

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
	// TODO shoudl refactor logic clean db
	const dbInstance = Database.getInstance();
	const query = 'DELETE FROM USER WHERE userName = ?';
	const result = await dbInstance.hitQuery(query, ['viethung']);
	console.log(result);
});

afterAll(() => {
	serverStop();
});

describe('/api', () => {
	const API_SIGNUP_ENDPOINT = '/v1/api/auth/signup';

	describe(`GET ${API_SIGNUP_ENDPOINT}`, () => {
		test('Create success non-exist user', async () => {
			const body = {
				username: 'viethung',
				email: 'chobicon1@gmail.com',
				password: '1235',
				birth: '1999-09-14',
			};
			const response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				body
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
	});
});
