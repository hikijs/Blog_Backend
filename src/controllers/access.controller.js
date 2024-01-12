'use strict';
const {
	OK,
	CREATED,
	REDIRECT,
} = require('../core/response/apiSuccessResponse');

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
		new OK({
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
		new OK({
			message: 'Logout Success!',
			metaData: await AccessService.logout(req, res),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	updatePassword = async (req, res, next) => {
		const message = await AccessService.updatePassword(req, res);
		new OK({
			message: message,
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
