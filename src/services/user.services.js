const UserQuery = require('../dbs/user.mysql');
const FriendQuery = require('../dbs/friends.mysql');
const { BadRequestError } = require('../core/error.response');
const VerifyCodeQuery = require('../dbs/verifyCode.mysql');
const { generateVerificationCode } = require('../helpers/randomCode');
const mailTransport = require('../helpers/mailHelper');
const {
	TIMEOUT,
	VERIFYCODE_TYPE,
} = require('../configs/configurations');
const { getApi, putApi } = require('../helpers/callApi');
const { createCookiesLogout } = require('../cookies/createCookies');
const USER_INFO_TYPE = {
	SELF: 'self',
	FRIEND: 'friend',
	OTHER: 'other',
};

class UserInfor {
	constructor(userData) {
		this.userData = userData;
		this.setType(USER_INFO_TYPE.SELF);
		delete this.userData.password;
	}

	setType(type) {
		this.type = type;
		this.userData['relationship'] = this.type;
	}

	getInfor() {
		switch (this.type) {
			case USER_INFO_TYPE.SELF:
				return this.userData;
			case USER_INFO_TYPE.FRIEND:
				return this.sanlitizeForFriend();
			case USER_INFO_TYPE.OTHER:
				return this.sanlitizeForOther();
			default:
				throw new Error('The type of user info is not correct');
		}
	}

	sanlitizeForFriend() {
		let listKeys = [
			'userId',
			'userName',
			'birthDay',
			'bio',
			'AvatarUrl',
			'relationship',
			'created_at',
		];
		let friendInfo = {};
		for (let key of listKeys) {
			friendInfo[key] = this.userData[key];
		}
		return friendInfo;
	}

	sanlitizeForOther() {
		let listKeys = [
			'userId',
			'userName',
			'bio',
			'AvatarUrl',
			'relationship',
			'created_at',
		];
		let otherInfo = {};
		for (let key of listKeys) {
			otherInfo[key] = this.userData[key];
		}
		return otherInfo;
	}
}
class UserService {
	static getMyProfile = async (req) => {
		const userId = req.cookies.userId;
		try {
			const userData = await UserQuery.getUserById(userId);
			const userInfor = new UserInfor(userData);
			return userInfor.getInfor();
		} catch (error) {
			throw new Error('Issue Happen When Get User Profile');
		}
	};

	static getUserInfo = async (req) => {
		const currentUserId = req.cookies.userId;
		const userId = req.params.userId;
		if (!userId || !currentUserId) {
			throw new BadRequestError({
				message: 'Please give more infor',
			});
		}
		try {
			const userExists = await UserQuery.checkUserExistById(userId);
			if (userExists) {
				const userData = await UserQuery.getUserById(userId);
				const userInfor = new UserInfor(userData);
				if (userData.userId != currentUserId) {
					// check if they are friend or not
					const friendShip = await FriendQuery.checkIfTheyAreFriend(
						currentUserId,
						userId
					);
					if (friendShip) {
						userInfor.setType(USER_INFO_TYPE.FRIEND);
					} else {
						userInfor.setType(USER_INFO_TYPE.OTHER);
					}
				}
				return userInfor.getInfor();
			} else {
				throw new BadRequestError({
					message: 'User does not exist',
				});
			}
		} catch (error) {
			throw new Error(`Get Profile failed with reason ${error}`);
		}
	};

	static updateProfile = async (req) => {
		const userId = req.cookies.userId;
		const { userName, email, bio, birthDay } = req.body;
		const queries = {
			userName: userName,
			email: email,
			bio: bio,
			birthDay: birthDay,
		};
		try {
			const newUserData = await UserQuery.updateUserProfile(
				queries,
				userId
			);
			return newUserData;
		} catch (error) {
			throw new Error(`Get Profile failed with reason ${error}`);
		}
	};

	static deleteProfile = async (req, res) => {
		const userId = req.cookies.userId;
		try {
			const deteteResult = await UserQuery.deleteUser(userId);
			createCookiesLogout(res);
			return deteteResult;
		} catch (error) {
			throw new Error(`Delete Profile failed with reason ${error}`);
		}
	};

	static verifyEmailForUser = async (req) => {
		const userId = req.cookies.userId;
		const userData = await UserQuery.getUserById(userId);
		if (!userData) {
			throw new BadRequestError({
				message: 'The user does not exist',
			});
		}
		if (userData.verified) {
			throw new BadRequestError({
				message: 'The user has been verified',
			});
		}
		try {
			const code = generateVerificationCode();
			const codeExpiry = Date.now() + TIMEOUT.verifyCode; // Token expires in 1 hour
			await VerifyCodeQuery.createNewVerifyCode(
				code,
				codeExpiry,
				VERIFYCODE_TYPE.VERIFY_EMAIL,
				userData.userId
			);
			await mailTransport.send(userData.email, 'Verification Email Code', code);
			const metaData = {
				link: `http://localhost:3000/v1/api/user/auth/verification-email/${code}`,
			};
			return metaData;
		} catch (error) {
			throw new Error(
				`verify email for user failed with reason ${error}`
			);
		}
	};

	static executeVerifyEmailForUser = async (req) => {
		const userId = req.cookies.userId;
		const verifyCode = req.body.verifyCode;
		if (!verifyCode || !userId) {
			throw new BadRequestError({
				message: 'Please give more information',
			});
		}
		const existingCode = await VerifyCodeQuery.checkCodeExistOrNot(
			verifyCode,
			userId,
			VERIFYCODE_TYPE.VERIFY_EMAIL
		);
		if (existingCode == null) {
			throw new BadRequestError({
				message: 'Incorrect Code Please Fill Again',
			});
		}
		try {
			await UserQuery.updateVerifiedStatus(true, userId);
			await VerifyCodeQuery.deleteVerifyCode(
				verifyCode,
				userId,
				VERIFYCODE_TYPE.VERIFY_EMAIL
			);
		} catch (error) {
			throw new BadRequestError({
				message: `Update status verified of user 
							is not successful with reason ${error}`,
			});
		}

		return {};
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

module.exports = UserService;
