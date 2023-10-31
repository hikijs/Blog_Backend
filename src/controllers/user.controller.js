'use strict';
const { OK } = require('../core/response/apiSuccessResponse');

const UserService = require('../services/user.services');

class UserController {
	// eslint-disable-next-line no-unused-vars
	getMyProfile = async (req, res, next) => {
		var metaData = await UserService.getMyProfile(req);
		delete metaData.password;
		const msg = new OK({
			message: 'Getting My Profile Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getUserInfo = async (req, res, next) => {
		var metaData = await UserService.getUserInfo(req);
		delete metaData.password;
		const msg = new OK({
			message: 'Getting User infor Success',
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
			message: 'Email has sent ',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	updateStatusVerifyForUser = async (req, res, next) => {
		var metaData = await UserService.updateStatusVerifyForUser(req);
		const msg = new OK({
			message: 'Status Verified of user has updated ',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	friendRequest = async (req, res, next) => {
		var metaData = await UserService.friendRequest(req);
		const msg = new OK({
			message: 'Your friend request was sent',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	answereRequest = async (req, res, next) => {
		var metaData = await UserService.answereRequest(req);
		const msg = new OK({
			message: 'Your reply was sent',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getFriendRequest = async (req, res, next) => {
		var metaData = await UserService.getFriendRequest(req);
		const msg = new OK({
			message: 'Get List Friend Requests Successfullys',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	unfriend = async (req, res, next) => {
		var metaData = await UserService.unfriend(req);
		const msg = new OK({
			message: 'Unfriend Successfullys',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getMyFriends = async (req, res, next) => {
		var metaData = await UserService.getMyFriends(req);
		const msg = new OK({
			message: 'Get List Friends Successfully',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getRecommendFollowings = async (req, res, next) => {
		var metaData = await UserService.getRecommendFollowings(req);
		const msg = new OK({
			message: 'Get List Recommend Following Successfully',
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
