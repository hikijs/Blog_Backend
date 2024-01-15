const FriendQuery = require('../dbs/friends.mysql');
const { BadRequestError } = require('../core/error.response');
const {
	NOTIFICATION_CONFIG,
} = require('../configs/configurations');
const TransactionQuery = require('../dbs/transaction.mysql');
const { NotifyManager } = require('./notification.services');
const { getApi, putApi } = require('../helpers/callApi');
const { PagnigationHelper } = require('../helpers/paginationHelper');


class FriendService {
	static getIncommingFriendRequest = async (req) => {
		const recipientId = req.cookies.userId;
		const status = req.query.status;
		if (!recipientId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		if (
			status &&
			status != 'Accepted' &&
			status != 'Rejected' &&
			status != 'Pending'
		) {
			throw new BadRequestError({
				message:
					'The status does not expectation, should be \
							  (Accepted ,Rejected or Pending)',
			});
		}

		try {
			const listRequests = await FriendQuery.getIncommingFriendRequestByStatus(
				recipientId,
				status
			);
			return { listRequests: listRequests };
		} catch (error) {
			throw new BadRequestError({
				message: Error.message,
			});
		}
	};

	static getOutgoingFriendRequest = async (req) => {
		const requesterId = req.cookies.userId;
		const status = req.query.status;
		if (!requesterId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		if (
			status &&
			status != 'Accepted' &&
			status != 'Rejected' &&
			status != 'Pending'
		) {
			throw new BadRequestError({
				message:
					'The status does not expectation, should be \
							  (Accepted ,Rejected or Pending)',
			});
		}

		try {
			const listRequests = await FriendQuery.getOutgoingFriendRequestByStatus(
				requesterId,
				status
			);
			return { listRequests: listRequests };
		} catch (error) {
			throw new BadRequestError({
				message: Error.message,
			});
		}
	};

	static friendRequest = async (req) => {
		const requesterId = req.cookies.userId;
		const recipientId = req.params.userId;

		if (!requesterId || !recipientId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		if (requesterId === recipientId) {
			throw new BadRequestError({
				message: 'Please double check your input',
			});
		}
		await TransactionQuery.startTransaction();
		try {
			// because this is the request friend so that status is Pending
			const status = 'Pending';
			await FriendQuery.upsertNewFriendRequest(
				requesterId,
				recipientId,
				status
			);
			// trigger sending notify for friend request event
			NotifyManager.triggerNotify(
				NOTIFICATION_CONFIG?.TYPES?.friendRequest,
				requesterId,
				recipientId
			);
			await TransactionQuery.commitTransaction();
		} catch (error) {
			await TransactionQuery.rollBackTransaction();
			throw new BadRequestError({
				message: error,
			});
		}
	};

	static unfriend = async (req) => {
		const requesterId = req.cookies.userId;
		const recipientId = req.params.friendId;
		if (!requesterId || !recipientId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		if (requesterId === recipientId) {
			throw new BadRequestError({
				message: 'Please double check your input',
			});
		}
		await TransactionQuery.startTransaction();
		try {
			await FriendQuery.deleteFriendShip(requesterId, recipientId);
			await TransactionQuery.commitTransaction();
		} catch (error) {
			await TransactionQuery.rollBackTransaction();
			throw new BadRequestError({
				message: error,
			});
		}
		return {};
	};

	static answereRequest = async (req) => {
		const recipientId = req.cookies.userId;
		const requesterId = req.params.requesterId;
		const status = req.query.ans;
		if (!requesterId || !recipientId || !status) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		if (requesterId === recipientId) {
			throw new BadRequestError({
				message: 'Please double check your input',
			});
		}
		const friendlyExistence = await FriendQuery.checkIfTheyAreFriend(
			requesterId,
			recipientId
		);
		if (friendlyExistence) {
			throw new BadRequestError({
				message: 'You and this user is the friend right now',
			});
		}
		// should be answered for pending request, that mean each request only was answered one time
		const friendRequestExist = await FriendQuery.isFriendRequestExist(
			requesterId,
			recipientId,
			'Pending'
		);
		if (!friendRequestExist) {
			throw new BadRequestError({
				message:
					'No friend request with status is pending exist, \
							 maybe you have answered before',
			});
		}
		// update friend request and frienship
		await TransactionQuery.startTransaction();
		try {
			await FriendQuery.updateFriendRequest(
				requesterId,
				recipientId,
				status
			);
			const currentStatus = await FriendQuery.getStatusOfFriendRequest(
				requesterId,
				recipientId
			);
			if (currentStatus == 'Accepted') {
				await FriendQuery.addNewFriendShip(recipientId, requesterId);
				// trigger sending notify for answere request event
				// this change the position of recipient and requester for mapping the notify
				NotifyManager.triggerNotify(
					NOTIFICATION_CONFIG?.TYPES?.acceptedRequest,
					recipientId,
					requesterId
				);
			}
			await TransactionQuery.commitTransaction();
		} catch (error) {
			await TransactionQuery.rollBackTransaction();
			throw new BadRequestError({
				message: error,
			});
		}
	};

	static getMyFriends = async (req) => {
		const userId = req.cookies.userId;
		if (!userId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		try {
			const listFriends = await FriendQuery.getFriendOfUser(userId);
			return { listFriends: listFriends };
		} catch (error) {
			throw new BadRequestError({
				message: error,
			});
		}
	};

	static getRecommendFollowings = async (req) => {
		const userId = req.cookies.userId;
		let expectLimit = Number(req.query.limit);
		let expectPage = Number(req.query.page) || 1;
		if (!userId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		try {
			const totalRecommends = await FriendQuery.getTotalNotFriend(userId);
			// for case limit = -1 get all records
			if(expectLimit == -1)
			{
				expectLimit = totalRecommends;
				expectPage = 1;
			}
			const paginationHelper = new PagnigationHelper(totalRecommends, expectPage, expectLimit);
			const { totalPage,
				currentPage,
				limit,
				offset,
				nextPage,
				prevPage } = paginationHelper.getInfo();
			const listNotFriendWithUser =
				await FriendQuery.getListNotFriendWithUser(
					userId,
					limit,
					offset
				);
			return {
				totalPage: totalPage,
				currentPage: currentPage,
				totalRecommends,
				nextPage: nextPage,
				prevPage: prevPage,
				RecommendFollowList: listNotFriendWithUser,
			};
		} catch (error) {
			throw new BadRequestError({
				message: error,
			});
		}
	};

	static getAllNotify = async (req) => {
		const userId = req.cookies.userId;
		// FIXME HARD CODE LINK
		const url = 'http://notification_backend:3002/notifies/' + userId;
		console.log(url);
		const data = await getApi(url);
		return data.data; // FIXME the data was return from notify service is data. data this is not god
	};

	static setReceivedNotifies = async (req) => {
		const userId = req.cookies.userId;
		// FIXME HARD CODE LINK
		const url = 'http://notification_backend:3002/receivedApi/' + userId;
		console.log(url);
		try {
			const data = await putApi(url);
			return { data };
		} catch (error) {
			throw new BadRequestError({
				message: 'Issue in notify service',
			});
		}
	};

	static readNotify = async (req) => {
		const notifyId = req.params.notifyId;
		// FIXME HARD CODE LINK
		const url = 'http://notification_backend:3002/readNotify/' + notifyId;
		console.log(url);
		try {
			const data = await putApi(url);
			return { data };
		} catch (error) {
			throw new BadRequestError({
				message: 'Issue in notify service',
			});
		}
	};
}

module.exports = FriendService;
