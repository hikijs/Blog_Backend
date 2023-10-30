'use strict';
const { OK, CREATED, REDIRECT } = require('../core/success.response');

const AccessService = require('../services/access.services');
class AccessController {
	// eslint-disable-next-line no-unused-vars
	signUp = async (req, res, next) => {
		new CREATED({
			message: 'Registered Success!',
			metaData: await AccessService.signUp(req.body),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	login = async (req, res, next) => {
		const { metaData } = await AccessService.login(req, res);
		new CREATED({
			message: 'Login Success!',
			metaData: metaData,
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	googleLogin = async (req, res, next) => {
		const { metaData } = await AccessService.googleLogin(req, res);
		new REDIRECT({
			message: 'Login By Google Success!',
			metaData: metaData,
		}).redirectToOauthPage(res);
	};

	// eslint-disable-next-line no-unused-vars
	callbackGoogleLogin = async (req, res, next) => {
		const { metaData } = await AccessService.callbackGoogleLogin(req, res);
		new REDIRECT({
			message: 'Callback login By Google Success!',
			metaData: metaData,
		}).redirectToFrontEnd(res);
	};

	// eslint-disable-next-line no-unused-vars
	facebookLogin = async (req, res, next) => {
		const { metaData } = await AccessService.facebookLogin(req, res);
		new REDIRECT({
			message: 'Login By Facebook Success!',
			metaData: metaData,
		}).redirectToOauthPage(res);
	};

	// eslint-disable-next-line no-unused-vars
	callbackFacebookLogin = async (req, res, next) => {
		const { metaData } = await AccessService.callbackFacebookLogin(
			req,
			res
		);
		new REDIRECT({
			message: 'Callback login By Facebook Success!',
			metaData: metaData,
		}).redirectToFrontEnd(res);
	};

	// eslint-disable-next-line no-unused-vars
	githubLogin = async (req, res, next) => {
		const { metaData } = await AccessService.githubLogin(req, res);
		new REDIRECT({
			message: 'Login By Github Success!',
			metaData: metaData,
		}).redirectToOauthPage(res);
	};

	// eslint-disable-next-line no-unused-vars
	callbackGithubLogin = async (req, res, next) => {
		const { metaData } = await AccessService.callbackGithubLogin(req, res);
		new OK({
			message: 'Callback login By Github Success!',
			metaData: metaData,
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	logout = async (req, res, next) => {
		new CREATED({
			message: 'Logout Success!',
			metaData: await AccessService.logout(req, res),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	forgotPassword = async (req, res, next) => {
		const { metaData } = await AccessService.forgotPassword(req, res);
		new OK({
			message: 'Sent Mail Successful',
			metaData: metaData,
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	forgotPasswordVerify = async (req, res, next) => {
		const { metaData } = await AccessService.forgotPasswordVerify(req, res);
		new OK({
			message: 'You Can Change New Password',
			metaData: metaData,
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	resetPassword = async (req, res, next) => {
		const { metaData } = await AccessService.resetPassword(req, res);
		new OK({
			message: 'updated new password',
			metaData: metaData,
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	ping = async (req, res, next) => {
		new OK({
			message: 'User Was Authenticated!',
		}).send(res);
	};
}

module.exports = new AccessController();
