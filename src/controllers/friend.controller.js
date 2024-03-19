'use strict';
const { OK } = require('../core/response/apiSuccessResponse');
const { HttpStatus } = require('../core/response/responseConfig');

const FriendService = require('../services/friend.services');

class FriendController {
	// eslint-disable-next-line no-unused-vars
	friendRequest = async (req, res, next) => {
		await FriendService.friendRequest(req);
		const msg = new OK({
			customStatus: HttpStatus._2xx.NO_CONTEND
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	answereRequest = async (req, res, next) => {
		await FriendService.answereRequest(req);
		const msg = new OK({
			customStatus: HttpStatus._2xx.NO_CONTEND
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getIncommingFriendRequest = async (req, res, next) => {
		var metaData = await FriendService.getIncommingFriendRequest(req);
		const msg = new OK({
			message: 'Get Incoming Friend Requests Successful',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getOutgoingFriendRequest = async (req, res, next) => {
		var metaData = await FriendService.getOutgoingFriendRequest(req);
		const msg = new OK({
			message: 'Get Outgoing Friend Requests Successful',
			metaData: metaData,
		});
		msg.send(res);
	};


	// eslint-disable-next-line no-unused-vars
	unfriend = async (req, res, next) => {
		await FriendService.unfriend(req);
		const msg = new OK({
			customStatus: HttpStatus._2xx.NO_CONTEND
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getMyFriends = async (req, res, next) => {
		var metaData = await FriendService.getMyFriends(req);
		const msg = new OK({
			message: 'Get List Friends Successfully',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getRecommendFollowings = async (req, res, next) => {
		var metaData = await FriendService.getRecommendFollowings(req);
		const msg = new OK({
			message: 'Get List Recommend Following Successfully',
			metaData: metaData,
		});
		msg.send(res);
	};
}

module.exports = new FriendController();
