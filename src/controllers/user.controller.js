'use strict';
const { OK } = require('../core/response/apiSuccessResponse');

const UserService = require('../services/user.services');

class UserController {
	// eslint-disable-next-line no-unused-vars
	getMyProfile = async (req, res, next) => {
		var metaData = await UserService.getMyProfile(req);
		const msg = new OK({
			message: 'Getting My Profile Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getUserInfo = async (req, res, next) => {
		var metaData = await UserService.getUserInfo(req);
		const msg = new OK({
			message: 'Getting User Infor Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	updateProfile = async (req, res, next) => {
		var metaData = await UserService.updateProfile(req);
		delete metaData.password;
		const msg = new OK({
			message: 'Update My Profile Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	deleteProfile = async (req, res, next) => {
		var metaData = await UserService.deleteProfile(req, res);
		// delete metaData.password
		new OK({
			message: 'Delete My Profile Success',
			metaData: metaData,
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	verifyEmailForUser = async (req, res, next) => {
		var metaData = await UserService.verifyEmailForUser(req);
		const msg = new OK({
			message: 'Request Verification Email Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	executeVerifyEmailForUser = async (req, res, next) => {
		var metaData = await UserService.executeVerifyEmailForUser(req);
		const msg = new OK({
			message: 'User Email Verified Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// FIXME should rename the function
	// eslint-disable-next-line no-unused-vars
	getAllNotify = async (req, res, next) => {
		var metaData = await UserService.getAllNotify(req);
		const msg = new OK({
			message: 'Get List Notifies Successfully',
			metaData: metaData,
		});
		msg.send(res);
	};

	// FIXME should rename the function
	// eslint-disable-next-line no-unused-vars
	setReceivedNotifies = async (req, res, next) => {
		var metaData = await UserService.setReceivedNotifies(req);
		const msg = new OK({
			message: 'Set Received Notify Done',
			metaData: metaData,
		});
		msg.send(res);
	};

	// FIXME should rename the function
	// eslint-disable-next-line no-unused-vars
	readNotify = async (req, res, next) => {
		var metaData = await UserService.readNotify(req);
		const msg = new OK({
			message: 'Read Notify Done',
			metaData: metaData,
		});
		msg.send(res);
	};
}

module.exports = new UserController();
