/* global beforeAll, afterAll, describe, test, expect */
const axios = require('axios');
const nock = require('nock');
const { serverStart, serverStop } = require('../mocks/server.mock');
const UserQuery = require('../../src/dbs/user.mysql');
const { CONFIGS } = require('../config/config');
const PostAction = require('../utils/postUtils');
const path = require('path');
const PostQuery = require('../../src/dbs/post.mysql');
let axiosAPIClient;
let cookiesAfterLogin = null;

// eslint-disable-next-line no-undef
const thumbnailPath = path.join(__dirname, 'sampleImage.png');

// Fake User Infor
const testUsers = {
	user1: {
		username: 'viethung',
		email: 'viethung@gmail.com',
		password: '1235',
		birth: '1999-09-14',
	},
};

// Fake Post Information
const postDatas = {
	publicPost: {
		postTitle: 'post 1',
		postCategory: ['technologies', 'food'],
		postPermit: 'public',
		postSummarize: 'this is summarize',
		postContent: 'this is the content',
	},
	privatePost: {
		postTitle: 'post 2',
		postCategory: ['technologies', 'food'],
		postPermit: 'private',
		postSummarize: 'this is summarize',
		postContent: 'this is the content',
	},
	followerPost: {
		postTitle: 'post 3',
		postCategory: ['technologies', 'food'],
		postPermit: 'follower',
		postSummarize: 'this is summarize',
		postContent: 'this is the content',
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
	beforeAll(async () => {
		await UserQuery.deleteUserByUserName(testUsers.user1.username);
		// signup and login user
		const API_SIGNUP_ENDPOINT = CONFIGS.apiUrls.SIGNUP;
		let response = await axiosAPIClient.post(
			API_SIGNUP_ENDPOINT,
			testUsers.user1
		);
		expect(response.status).toBe(201);
		expect(response.statusText).toBe('Created');
		const { message } = response.data;
		expect(message).toEqual('Registered Success!');

		const API_LOGIN_ENDPOINT = CONFIGS.apiUrls.LOGIN;
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
		// Create a new FormData object
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
	// clean correct user after finish
	afterAll(async () => {
		// clean user and user's data
		// await UserQuery.deleteUserByUserName(testUsers.user1.username);
	});

	// STARTING TESTCASE
	const API_PUBLISH_POST = CONFIGS.apiUrls.PUBLISH_POST;
	describe(`Publish Post Without Login ${API_PUBLISH_POST}`, () => {
		test('401 Can not publish if it is non-authen user', async () => {
			const response = await PostAction.publishPost(
				axiosAPIClient,
				thumbnailPath,
				postDatas.publicPost,
				null
			);
			expect(response.status).toBe(401);
			expect(response.statusText).toBe('Unauthorized');
			expect(response.data).toMatchObject({
				code: 10003,
				message: 'Invalid request',
			});
		});

		test('200 Publish Posts Successfull', async () => {
			for (const keys in postDatas) {
				const response = await PostAction.publishPost(
					axiosAPIClient,
					thumbnailPath,
					postDatas[keys],
					cookiesAfterLogin
				);
				expect(response.status).toBe(200);
				expect(response.statusText).toBe('OK');
				expect(response.data).toMatchObject({
					code: 10001,
					message: 'Update new Post With Thumbnail Success!',
				});
				const { newPostId } = response.data.metaData;
				expect(newPostId).not.toBe(undefined);
				const postData = await PostQuery.getPostByPostId(newPostId);
				const {
					postId,
					title,
					statusEdit,
					sharePermission,
					summarize,
					content,
					thumbnailUrl,
				} = postData;
				// Check post data is correct
				expect(title).toEqual(postDatas[keys].postTitle);
				expect(statusEdit).toEqual('publish');
				expect(sharePermission).toEqual(postDatas[keys].postPermit);
				expect(summarize).toEqual(postDatas[keys].postSummarize);
				expect(content).toEqual(postDatas[keys].postContent);
				expect(content).toEqual(postDatas[keys].postContent);

				const { updated_at, created_at } = postData;
				expect(updated_at).toEqual(created_at);

				// Check owner of post is correct
				const { userId, userName } = postData;

				const userData = await UserQuery.getUserById(userId);
				expect(userData.userId).toEqual(userId);
				expect(userData.userName).toEqual(userName);
				expect(userData.userName).toEqual(testUsers.user1.username);
				expect(userData.email).toEqual(testUsers.user1.email);
				expect(userData.password).not.toEqual(testUsers.user1.password);

				// Check the post has only one thumbnail
				const thumbnailData = await PostQuery.getPostThumbnail(postId);
				expect(thumbnailData.imageUrl).toEqual(thumbnailUrl);
				expect(thumbnailData.postId).toEqual(postId);
				expect(thumbnailData.userId).toEqual(userData.userId);

				// Get Post Infor By Api
				const responseForDetailPost = await PostAction.getPostInfor(
					axiosAPIClient,
					postId,
					cookiesAfterLogin
				);
				expect(responseForDetailPost.status).toBe(200);
				expect(responseForDetailPost.statusText).toBe('OK');
				expect(responseForDetailPost.data).toMatchObject({
					code: 10001,
					message: 'Read Success',
				});

				const { metaData } = responseForDetailPost.data;
				expect(metaData.userName).toEqual(testUsers.user1.username);
				expect(metaData.userId).toEqual(userId);
				expect(metaData.postId).toEqual(postId);
				expect(metaData.thumbnailUrl).toEqual(thumbnailUrl);
				expect(metaData.title).toEqual(title);
				expect(metaData.statusEdit).toEqual(statusEdit);
				expect(metaData.sharePermission).toEqual(sharePermission);
				expect(metaData.summarize).toEqual(summarize);
				expect(metaData.content).toEqual(content);
				const categoriesLowCase = postDatas[keys].postCategory.map(
					(element) => element.toLowerCase()
				);
				expect(metaData.categrogies).toEqual(categoriesLowCase);
			}
		});
	});
});
