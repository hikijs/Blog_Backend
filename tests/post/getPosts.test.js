// setup user
// setup post
// setup relationship

/* global beforeAll, afterAll, describe, test, expect, beforeEach, afterEach */
const axios = require('axios');
const nock = require('nock');
const { serverStart, serverStop } = require('../mocks/server.mock');
const UserQuery = require('../../src/dbs/user.mysql');
const { CONFIGS } = require('../config/config');
const PostAction = require('../utils/postUtils');
const path = require('path');
const { createLoginUser2System } = require('../utils/createSession');
const FriendQuery = require('../../src/dbs/friends.mysql');
const { publishPostsForUser } = require('../utils/createPosts');
const Database = require('../../src/dbs/init.mysql');
const { OverviewPost } = require('./overviewPost');
let axiosAPIClient;

// eslint-disable-next-line no-undef
const thumbnailPath = path.join(__dirname, 'sampleImage.png');

// Fake User Infor
let testUsers = {
	user1: {
		username: 'testUser1',
		email: 'testUser1@gmail.com',
		password: 'passwordstring',
		birth: '1998-09-10',
	},
	user2: {
		username: 'testUser2',
		email: 'testUser2@gmail.com',
		password: 'passwordstring',
		birth: '2003-11-10',
	},
	user3: {
		username: 'testUser3',
		email: 'testUser3@gmail.com',
		password: 'passwordstring',
		birth: '2002-12-10',
	},
};

beforeAll(async () => {
	try {
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
	} catch (error) {
		throw new Error(error);
	}
});

afterAll(() => {
	serverStop();
});

describe('APIs Create Post', () => {
	let user1Data = null;
	let user2Data = null;
	let user3Data = null;

	beforeAll(async () => {
		// Singup and login the needed user to system
		for (let userKey in testUsers) {
			await UserQuery.deleteUserByUserName(testUsers[userKey].username);
		}

		for (let userKey in testUsers) {
			let cookies = await createLoginUser2System(
				axiosAPIClient,
				testUsers[userKey]
			);
			// update cookies for each user to support the next request
			testUsers[userKey] = {
				...testUsers[userKey],
				cookies,
			};
		}

		// make user1 and user2 to be a friend
		user1Data = await UserQuery.getUserByUserName(testUsers.user1.username);
		expect(user1Data).not.toBe(null);
		user2Data = await UserQuery.getUserByUserName(testUsers.user2.username);
		expect(user2Data).not.toBe(null);
		user3Data = await UserQuery.getUserByUserName(testUsers.user3.username);
		expect(user3Data).not.toBe(null);
	});
	// clean correct user after finish
	afterAll(async () => {
		// clean user and user's data
		// for (let userKey in testUsers)
		// {
		// 	await UserQuery.deleteUserByUserName(testUsers[userKey].username);
		// }
	});

	describe('User Did Not Publish Post Before', () => {
		beforeAll(async () => {});
		afterAll(async () => {});
		test('user read their post success', async () => {
			const response = await PostAction.getAllMyPost(
				axiosAPIClient,
				testUsers.user1.cookies
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data).toMatchObject({
				code: 10001,
				message: 'get all post by user id success!',
			});
			const { numberPosts, listPost } = response.data.metaData;
			expect(numberPosts).toEqual(0);
			expect(numberPosts).toEqual(listPost.length);
		});
	});

	describe('User Had Published Some Posts', () => {
		// Storing the execution publish post of user in this tc
		const overviewPost = new OverviewPost();
		beforeAll(async () => {
			//
		});
		afterAll(async () => {
			//
		});

		beforeEach(async () => {
			// publish post for each user in testUsers
			for (const user in testUsers) {
				const result = await publishPostsForUser(
					testUsers[user],
					axiosAPIClient,
					thumbnailPath
				);
				overviewPost.addPublishPostForUser(user, result);
				expect(
					overviewPost.getSummarizePostPublish4User(user)
				).toMatchObject({
					author: testUsers[user].username,
				});
			}
			expect(overviewPost.getNumsUserPublishPost()).toEqual(
				Object.keys(testUsers).length
			);
		});

		afterEach(async () => {
			// Clean All Post Of Each User
			for (const user in testUsers) {
				const response = await PostAction.deleteAllPost(
					axiosAPIClient,
					testUsers[user].cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'Delete All Successfull',
				});

				const getMyPostsRsp = await PostAction.getAllMyPost(
					axiosAPIClient,
					testUsers[user].cookies
				);
				expect(getMyPostsRsp.status).toBe(200);
				expect(getMyPostsRsp.statusText).toBe('OK');
				expect(getMyPostsRsp.data).toMatchObject({
					code: 10001,
					message: 'get all post by user id success!',
					metaData: {
						listPost: [],
						numberPosts: 0,
					},
				});
			}

			const dbInstance = Database.getInstance();
			const getPostQuery = 'SELECT * FROM POST';
			const result = await dbInstance.hitQuery(getPostQuery);
			// ensure that there is no post in the db
			expect(result.length).toEqual(0);
			// reset the public Infor
			overviewPost.cleanUp();
		});

		test('Each User read their post success', async () => {
			for (const user in testUsers) {
				const {
					numTotalPosts,
					numsPrivatePosts,
					numFollowerPosts,
					numsPublicPosts,
				} = overviewPost.getSummarizePostPublish4User(user);
				const response = await PostAction.getAllMyPost(
					axiosAPIClient,
					testUsers[user].cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all post by user id success!',
				});
				const { numberPosts, listPost } = response.data.metaData;
				expect(numberPosts).toEqual(numTotalPosts);
				expect(numberPosts).toEqual(listPost.length);

				let coutingStatusPostArr = [0, 0, 0];
				let privateIndex = 0;
				let followerIndex = 1;
				let publicIndex = 2;

				for (const post of listPost) {
					const { author, postData } = post;
					expect(author.userName).toEqual(testUsers[user].username);
					expect(author.userName).toEqual(
						overviewPost.getSummarizePostPublish4User(user).author
					);
					if (postData.sharePermission == 'public') {
						coutingStatusPostArr[publicIndex]++;
					} else if (postData.sharePermission == 'follower') {
						coutingStatusPostArr[followerIndex]++;
					} else if (postData.sharePermission == 'private') {
						coutingStatusPostArr[privateIndex]++;
					} else {
						throw new Error('The share permission is invalid');
					}
				}
				expect(coutingStatusPostArr).toEqual([
					numsPrivatePosts,
					numFollowerPosts,
					numsPublicPosts,
				]);
			}
		}, 20000);

		test('Other Can View Public Post', async () => {
			// clean up all post of user2
			const cleanUpResult = await PostAction.deleteAllPost(
				axiosAPIClient,
				testUsers.user2.cookies
			);
			expect(cleanUpResult.status).toBe(200);
			expect(cleanUpResult.statusText).toBe('OK');
			expect(cleanUpResult.data).toMatchObject({
				code: 10001,
				message: 'Delete All Successfull',
			});

			const getMyPostsRsp = await PostAction.getAllMyPost(
				axiosAPIClient,
				testUsers.user2.cookies
			);
			expect(getMyPostsRsp.status).toBe(200);
			expect(getMyPostsRsp.statusText).toBe('OK');
			expect(getMyPostsRsp.data).toMatchObject({
				code: 10001,
				message: 'get all post by user id success!',
				metaData: {
					listPost: [],
					numberPosts: 0,
				},
			});

			overviewPost.cleanPostInforForUser('user2');
			// user2 can view public post of user1 and user3 although he does not publish any post
			{
				const response = await PostAction.getAllPost(
					axiosAPIClient,
					testUsers.user2.cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all posts (friend posts also) success!',
				});
				const { numberPosts, listPost } = response.data.metaData;

				const numPublicPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'public'
				);
				expect(numberPosts).toEqual(
					overviewPost.getTotalPublicPosts() - numPublicPostOfUser2
				);
				expect(numberPosts).toEqual(listPost.length);

				for (const post of listPost) {
					const { author } = post;
					expect(
						author.userName == testUsers.user1.username ||
							author.userName == testUsers.user3.username
					).toBe(true);
				}
			}
			// user3 can view his posts and public posts of user1 because user does not publish any post yet
			{
				const response = await PostAction.getAllPost(
					axiosAPIClient,
					testUsers.user3.cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all posts (friend posts also) success!',
				});
				const { numberPosts, listPost } = response.data.metaData;

				const numsTotalPostOfUser3 = overviewPost.getPostInforByUser(
					'user3',
					'all'
				);
				const numspublicPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'public'
				);
				expect(numberPosts).toEqual(
					numsTotalPostOfUser3 + numspublicPostOfUser1
				);
				expect(numberPosts).toEqual(listPost.length);

				for (const post of listPost) {
					const { author } = post;
					expect(
						author.userName == testUsers.user1.username ||
							author.userName == testUsers.user3.username
					).toBe(true);
				}
			}
		}, 20000);

		test('Friend Can View Public And Follower Post', async () => {
			await FriendQuery.addNewFriendShip(
				user1Data.userId,
				user2Data.userId
			);
			// user2 can view public and follower post of user1 and public post of user3
			{
				const response = await PostAction.getAllPost(
					axiosAPIClient,
					testUsers.user2.cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all posts (friend posts also) success!',
				});
				const { numberPosts, listPost } = response.data.metaData;
				let numsPublicPostOfUser3 = overviewPost.getPostInforByUser(
					'user3',
					'public'
				);
				let numsPublicPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'public'
				);
				let numsFollowerPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'follower'
				);
				let numsTotalPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'all'
				);
				expect(numberPosts).toEqual(
					numsTotalPostOfUser2 +
						numsPublicPostOfUser3 +
						numsPublicPostOfUser1 +
						numsFollowerPostOfUser1
				);
				expect(numberPosts).toEqual(listPost.length);
				for (const post of listPost) {
					const { author, postData } = post;
					const { userName } = author;
					const { sharePermission } = postData;
					if (userName == testUsers.user2.username) {
						//self
						numsTotalPostOfUser2--;
					} else if (userName == testUsers.user1.username) {
						//friend
						expect(
							sharePermission == 'public' ||
								sharePermission == 'follower'
						).toBe(true);
						if (sharePermission == 'public') {
							numsPublicPostOfUser1--;
						} else {
							numsFollowerPostOfUser1--;
						}
					} else if (userName == testUsers.user3.username) {
						// stranger
						expect(sharePermission == 'public').toBe(true);
						numsPublicPostOfUser3--;
					} else {
						// Error When Go There
						expect(false).toBe(true);
					}
				}
				// if all counter variable is zero all post type public, follower and private
				// that was read by user is correct
				expect(numsPublicPostOfUser3).toEqual(0);
				expect(numsPublicPostOfUser1).toEqual(0);
				expect(numsFollowerPostOfUser1).toEqual(0);
				expect(numsTotalPostOfUser2).toEqual(0);
			}
			// user2 continue friend with user3
			await FriendQuery.addNewFriendShip(
				user2Data.userId,
				user3Data.userId
			);
			{
				// user2 can view public, follower post of user1 and user3 and his posts
				const response = await PostAction.getAllPost(
					axiosAPIClient,
					testUsers.user2.cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all posts (friend posts also) success!',
				});
				const { numberPosts, listPost } = response.data.metaData;
				let numsTotalPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'all'
				);
				let numsPublicPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'public'
				);
				let numsFollowerPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'follower'
				);
				let numsPublicPostOfUser3 = overviewPost.getPostInforByUser(
					'user3',
					'public'
				);
				let numsFollowerPostOfUser3 = overviewPost.getPostInforByUser(
					'user3',
					'follower'
				);
				expect(numberPosts).toEqual(
					numsTotalPostOfUser2 +
						numsPublicPostOfUser3 +
						numsFollowerPostOfUser3 +
						numsPublicPostOfUser1 +
						numsFollowerPostOfUser1
				);
				expect(numberPosts).toEqual(listPost.length);
				for (const post of listPost) {
					const { author, postData } = post;
					const { userName } = author;
					const { sharePermission } = postData;
					if (userName == testUsers.user2.username) {
						//self
						numsTotalPostOfUser2--;
					} else if (userName == testUsers.user1.username) {
						//friend
						expect(
							sharePermission == 'public' ||
								sharePermission == 'follower'
						).toBe(true);
						if (sharePermission == 'public') {
							numsPublicPostOfUser1--;
						} else {
							numsFollowerPostOfUser1--;
						}
					} else if (userName == testUsers.user3.username) {
						// stranger
						expect(
							sharePermission == 'public' ||
								sharePermission == 'follower'
						).toBe(true);
						if (sharePermission == 'public') {
							numsPublicPostOfUser3--;
						} else {
							numsFollowerPostOfUser3--;
						}
					} else {
						// Error When Go There
						expect(false).toBe(true);
					}
				}
				// if all counter variable is zero all post type public, follower and private
				// that was read by user is correct
				expect(numsPublicPostOfUser3).toEqual(0);
				expect(numsFollowerPostOfUser3).toEqual(0);
				expect(numsPublicPostOfUser1).toEqual(0);
				expect(numsFollowerPostOfUser1).toEqual(0);
				expect(numsTotalPostOfUser2).toEqual(0);
			}

			// user1 can view public + follower user2's post, public user3's post and his posts
			{
				const response = await PostAction.getAllPost(
					axiosAPIClient,
					testUsers.user1.cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all posts (friend posts also) success!',
				});
				const { numberPosts, listPost } = response.data.metaData;
				let numsTotalPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'all'
				);
				let numsPublicPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'public'
				);
				let numsFollowerPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'follower'
				);
				let numsPublicPostOfUser3 = overviewPost.getPostInforByUser(
					'user3',
					'public'
				);
				expect(numberPosts).toEqual(
					numsTotalPostOfUser1 +
						numsPublicPostOfUser2 +
						numsFollowerPostOfUser2 +
						numsPublicPostOfUser3
				);
				expect(numberPosts).toEqual(listPost.length);
				for (const post of listPost) {
					const { author, postData } = post;
					const { userName } = author;
					const { sharePermission } = postData;
					if (userName == testUsers.user1.username) {
						//self
						numsTotalPostOfUser1--;
					} else if (userName == testUsers.user2.username) {
						//friend
						expect(
							sharePermission == 'public' ||
								sharePermission == 'follower'
						).toBe(true);
						if (sharePermission == 'public') {
							numsPublicPostOfUser2--;
						} else {
							numsFollowerPostOfUser2--;
						}
					} else if (userName == testUsers.user3.username) {
						// stranger
						expect(sharePermission == 'public').toBe(true);
						numsPublicPostOfUser3--;
					} else {
						// Error When Go There
						expect(false).toBe(true);
					}
				}
				// if all counter variable is zero all post type public, follower and private
				// that was read by user is correct
				expect(numsTotalPostOfUser1).toEqual(0);
				expect(numsPublicPostOfUser2).toEqual(0);
				expect(numsFollowerPostOfUser2).toEqual(0);
				expect(numsPublicPostOfUser3).toEqual(0);
			}

			// user3 can read his post, public user1's post, public+follower user2's post
			{
				const response = await PostAction.getAllPost(
					axiosAPIClient,
					testUsers.user3.cookies
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'get all posts (friend posts also) success!',
				});
				const { numberPosts, listPost } = response.data.metaData;
				let numsTotalPostOfUser3 = overviewPost.getPostInforByUser(
					'user3',
					'all'
				);
				let numsPublicPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'public'
				);
				let numsFollowerPostOfUser2 = overviewPost.getPostInforByUser(
					'user2',
					'follower'
				);
				let numsPublicPostOfUser1 = overviewPost.getPostInforByUser(
					'user1',
					'public'
				);
				expect(numberPosts).toEqual(
					numsTotalPostOfUser3 +
						numsPublicPostOfUser2 +
						numsFollowerPostOfUser2 +
						numsPublicPostOfUser1
				);
				expect(numberPosts).toEqual(listPost.length);
				for (const post of listPost) {
					const { author, postData } = post;
					const { userName } = author;
					const { sharePermission } = postData;
					if (userName == testUsers.user3.username) {
						//self
						numsTotalPostOfUser3--;
					} else if (userName == testUsers.user2.username) {
						//friend
						expect(
							sharePermission == 'public' ||
								sharePermission == 'follower'
						).toBe(true);
						if (sharePermission == 'public') {
							numsPublicPostOfUser2--;
						} else {
							numsFollowerPostOfUser2--;
						}
					} else if (userName == testUsers.user1.username) {
						// stranger
						expect(sharePermission == 'public').toBe(true);
						numsPublicPostOfUser1--;
					} else {
						// Error When Go There
						expect(false).toBe(true);
					}
				}
				// if all counter variable is zero all post type public, follower and private
				// that was read by user is correct
				expect(numsTotalPostOfUser3).toEqual(0);
				expect(numsPublicPostOfUser2).toEqual(0);
				expect(numsFollowerPostOfUser2).toEqual(0);
				expect(numsPublicPostOfUser1).toEqual(0);
			}
		}, 20000);
	});
});
