/* global expect */
// signup and login user
const { CONFIGS } = require('../config/config');
async function createLoginUser2System(axiosAPIClient, userInfor) {
	const API_SIGNUP_ENDPOINT = CONFIGS.apiUrls.SIGNUP;
	let response = await axiosAPIClient.post(API_SIGNUP_ENDPOINT, userInfor);
	expect(response.status).toBe(201);
	expect(response.statusText).toBe('Created');
	const { message } = response.data;
	expect(message).toEqual('Registered Success!');

	const API_LOGIN_ENDPOINT = CONFIGS.apiUrls.LOGIN;
	response = await axiosAPIClient.post(
		API_LOGIN_ENDPOINT,
		{
			username: userInfor.username,
			password: userInfor.password,
		},
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
	expect(response.status).toBe(200);
	expect(response.statusText).toBe('OK');
	const cookiesLogin = response.headers['set-cookie'];

	// Create a new FormData object
	const API_PING = CONFIGS.apiUrls.PING;
	response = await axiosAPIClient.get(API_PING, {
		headers: {
			Cookie: cookiesLogin,
		},
	});
	expect(response.status).toBe(200);
	expect(response.statusText).toBe('OK');
	expect(response.data.message).toBe('User Was Authenticated!');
	return cookiesLogin;
}

module.exports = { createLoginUser2System };
