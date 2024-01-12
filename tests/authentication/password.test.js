/* global beforeAll, afterAll, describe, test, expect, beforeEach, afterEach */
const axios = require('axios');
const nock = require('nock');
const { serverStart, serverStop } = require('../mocks/server.mock');
const UserQuery = require('../../src/dbs/user.mysql');
const { CONFIGS } = require('../config/config');
const verifyCodeMysql = require('../../src/dbs/verifyCode.mysql');
const { VERIFYCODE_TYPE } = require('../../src/configs/configurations');
let cookiesAfterLogin = null;
let axiosAPIClient;
const API_LOGIN_ENDPOINT = CONFIGS.apiUrls.LOGIN;
const API_PASSWORD_ENDPOINT = CONFIGS.apiUrls.PASSWORD;

beforeAll(async () => {
	console.log('------- START TESTING PASSWORD GROUP -------');
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
	console.log('------- END TESTING PASSWORD GROUP -------');
	serverStop();
});

const testUsers = {
	user1: {
		username: 'viethung',
		email: 'chobicon1@gmail.com',
		password: '1234',
		birth: '1999-09-14',
	}
};

describe('Update/Reset Password behaviors', () => {
	// case 1. unauthenticated user request to reset password
	describe('Unauthenticated User Updating Password', () =>{
		beforeAll(async () => {
			// Sigup user to the application
			await UserQuery.deleteUserByUserName(testUsers.user1.username);
			const API_SIGNUP_ENDPOINT = CONFIGS.apiUrls.SIGNUP;
			let response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				testUsers.user1
			);
			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
			const { message } = response.data;
			expect(message).toEqual('Registered Success!');
		});

		afterAll(async () => {
			// clean up the user after test
			await UserQuery.deleteUserByUserName(testUsers.user1.username);
		});

		test('Should return 400 if missing query and body', async () => {
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{}, //body
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('Please provide either query for unauthenticated user or body for authenticated user');			
		});

		test('Should return 400 if have both query and body', async () => {
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT + '?email=' + testUsers.user1.email,
				{
					newPassword: '12345',
					confirmPassword: '12345'
				},
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('Please provide either query or body');			
		});

		test('Should return 400 if email does not exist', async () => {
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT + '?email=' + 'faker@gmail.com',
				{}, //body
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('The email does not register yet');			
		});

		test('Should return 200 if send reset password url and reset password successfully', async () => {
			let response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT + '?email=' + testUsers.user1.email,
				{}, //body
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data.code).toBe(10001);
			expect(response.data.message).toBe('Send Reset Url Success');	
			
			// getting the user id and reset code that was created in step request-forgot password above
			const existingUser = await UserQuery.getUserByUserName(testUsers.user1.username);
			const resetCode = await verifyCodeMysql.getResetCodeByUserId(existingUser.userId, VERIFYCODE_TYPE.FORGOT_PASSWORD);
			const resetToken = existingUser.userId + '@' + resetCode.code;
			const newPassword = '123456789';
			response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{
					resetToken: resetToken,
					newPassword: newPassword,
					confirmPassword: newPassword,
				},
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data.code).toBe(10001);
			expect(response.data.message).toBe('Reset Password Success');	
			
			// check that after reset password, the reset code was deleted
			const existingResetCode = await verifyCodeMysql.getResetCodeByUserId(existingUser.id, VERIFYCODE_TYPE.FORGOT_PASSWORD);
			expect(existingResetCode).toBe(null);

			// relogin with old password
			response = await axiosAPIClient.post(
				API_LOGIN_ENDPOINT,
				{
					username: testUsers.user1.username,
					password: testUsers.user1.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			expect(response.status).toBe(401);
			expect(response.statusText).toBe('Unauthorized');
			expect(response.data.code).toBe(10003);
			expect(response.data.message).toBe('Authentication Failed');

			// relongin with new password
			response = await axiosAPIClient.post(
				API_LOGIN_ENDPOINT,
				{
					username: testUsers.user1.username,
					password: newPassword,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data.code).toBe(10001);
			expect(response.data.message).toBe('Login Success!');
		});
	});
	// case 2. authenticated user request to reset password
	// - register => login => change password
	describe('Authenticated User Updating Password', () =>{
		beforeAll(async () => {
			// signup and log user in to the application
			await UserQuery.deleteUserByUserName(testUsers.user1.username);
			const API_SIGNUP_ENDPOINT = CONFIGS.apiUrls.SIGNUP;
			let response = await axiosAPIClient.post(
				API_SIGNUP_ENDPOINT,
				testUsers.user1
			);
			expect(response.status).toBe(201);
			expect(response.statusText).toBe('Created');
			const { message } = response.data;
			expect(message).toEqual('Registered Success!');

			response = await axiosAPIClient.post(
				API_LOGIN_ENDPOINT,
				{
					username: testUsers.user1.username,
					password: testUsers.user1.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			cookiesAfterLogin = response.headers['set-cookie'];
			const API_PING = CONFIGS.apiUrls.PING;
			response = await axiosAPIClient.get(API_PING, {
				headers: {
					Cookie: cookiesAfterLogin,
				},
			});
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data.message).toBe('User Was Authenticated!');
		});

		afterAll(async () => {
			await UserQuery.deleteUserByUserName(testUsers.user1.username);
		});
		test('Should return 400 if missing body and query', async () => {
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('Please provide either query for unauthenticated user or body for authenticated user');			
		});

		test('Should return 400 if receiving query', async () => {
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT + '?email=' + testUsers.user1.email,
				{}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('Not enough information request');			
		});

		test('Should return 400 if receive query and body in same request', async () => {				
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT + '?email=' + testUsers.user1.email,
				{
					newPassword: '12345',
					confirmPassword: '12345',
				}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('Please provide either query or body');			
		});

		test('Should return 400 if body is invalid', async () => {
			let response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{
					resetToken: '954117c7-9e49-11ee-915e-0242ac120007@8LABVW',
					newPassword: '12345',
					confirmPassword: '12345',
				}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('Redundant information request');
			
			response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{
					fakerKey: '954117c7-9e49-11ee-915e-0242ac120007@8LABVW',
					newPassword: '12345',
					confirmPassword: '12345',
				}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);


			response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{
					newPasswords: '12345',
					confirmPassword: '12345',
				}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
		});

		// test('FIXME Should return 400 if query exist and body exist but the password does not match', async () => {				
		// 	const response = await axiosAPIClient.put(
		// 		API_PASSWORD_ENDPOINT + '?email=' + testUsers.user1.email,
		// 		{
		// 			newPassword: '12345',
		// 			confirmPassword: '123456',
		// 		}, //body
		// 		{
		// 			headers: {
		// 				Cookie: cookiesAfterLogin,
		// 			},
		// 		}
		// 	);
		// 	expect(response.status).toBe(400);
		// 	expect(response.statusText).toBe('Bad Request');
		// 	expect(response.data.code).toBe(10004);
		// 	expect(response.data.message).toBe('Please provide either query or body');			
		// });

		test('Should return 400 if newPassword diff with the confirmPassword', async () => {				
			const response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{
					newPassword: '12345',
					confirmPassword: '123456',
				}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(400);
			expect(response.statusText).toBe('Bad Request');
			expect(response.data.code).toBe(10004);
			expect(response.data.message).toBe('confirm Password does not match');			
		});


		test('Should return 200 if password was changed successfully', async () => {
			const newPassword = '12345';
			let response = await axiosAPIClient.put(
				API_PASSWORD_ENDPOINT,
				{
					newPassword: newPassword,
					confirmPassword: newPassword,
				}, //body
				{
					headers: {
						Cookie: cookiesAfterLogin,
					},
				}
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data.code).toBe(10001);
			expect(response.data.message).toBe('Update Password Success');		
			
			// relogin with old password
			response = await axiosAPIClient.post(
				API_LOGIN_ENDPOINT,
				{
					username: testUsers.user1.username,
					password: testUsers.user1.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			expect(response.status).toBe(401);
			expect(response.statusText).toBe('Unauthorized');
			expect(response.data.code).toBe(10003);
			expect(response.data.message).toBe('Authentication Failed');
			
			// relongin with new password
			response = await axiosAPIClient.post(
				API_LOGIN_ENDPOINT,
				{
					username: testUsers.user1.username,
					password: newPassword,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data.code).toBe(10001);
			expect(response.data.message).toBe('Login Success!');
		});

	});
});
