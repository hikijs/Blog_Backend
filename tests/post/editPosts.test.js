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
let axiosAPIClient;

function generateCombinations(fields) {
	const result = [[]];
	const totalSubsets = 1 << fields.length; // 2^n

	for (let i = 1; i < totalSubsets; i++) {
		const subset = [];
		for (let j = 0; j < fields.length; j++) {
			if (i & (1 << j)) {
				subset.push(fields[j]);
			}
		}
		result.push(subset);
	}

	return result;
}

function pickRandomElement(array) {
	const index = Math.floor(Math.random() * array.length);
	return array[index];
}

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

const PostFakes = {
	publicPost: {
		postTitle: 'post public',
		postCategory: ['technologies', 'food'],
		postPermit: 'public',
		postSummarize: 'this is summarize',
		postContent: 'this is the content',
	},
	privatePost: {
		postTitle: 'post private',
		postCategory: ['technologies', 'food'],
		postPermit: 'private',
		postSummarize: 'this is summarize',
		postContent: 'this is the content',
	},
	followerPost: {
		postTitle: 'post follower',
		postCategory: ['technologies', 'food'],
		postPermit: 'follower',
		postSummarize: 'this is summarize',
		postContent: 'this is the content',
	},
};

const statusEdit = ['draft', 'publish', 'unpublish'];
const sharePermission = ['private', 'follower', 'public'];
const ListCategory = ['technologies', 'travel'];

const FieldEditPosts = {
	title: 'new title',
	statusEdit: () => pickRandomElement(statusEdit),
	sharePermission: () => pickRandomElement(sharePermission),
	summarize: 'this is the summarize',
	content: 'this is the content',
	categrories: () => generateCombinations(ListCategory),
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
		for (let userKey in testUsers) {
			await UserQuery.deleteUserByUserName(testUsers[userKey].username);
		}
	});

	describe('User Edit Post', () => {
		beforeAll(async () => {
			//
		});
		afterAll(async () => {
			//
		});

		beforeEach(async () => {});

		afterEach(async () => {});

		test('User Publish Then Edit Post', async () => {
			// publish post for each user in testUsers
			const response = await PostAction.publishPost(
				axiosAPIClient,
				thumbnailPath,
				PostFakes.publicPost,
				testUsers.user1.cookies
			);
			expect(response.status).toBe(200);
			expect(response.statusText).toBe('OK');
			expect(response.data).toMatchObject({
				code: 10001,
				message: 'Update new Post With Thumbnail Success!',
			});

			console.log(response.data);
			const { newPostId } = response.data.metaData;
			// get all combinations of field to edit post
			const fieldEditCombinations = generateCombinations(
				Object.keys(FieldEditPosts)
			);
			console.log(fieldEditCombinations);
			for (let subFields of fieldEditCombinations) {
				if (subFields.length == 0) {
					const response = await PostAction.editPost(
						axiosAPIClient,
						newPostId,
						{},
						testUsers.user1.cookies
					);
					expect(response.status).toBe(400);
					expect(response.statusText).toBe('Bad Request');
					expect(response.data).toMatchObject({
						code: 10004,
						message: 'Please Provide The Change',
					});
				}
				else if (subFields.includes('categrories')) {
					let subCategrories = [];
					if (typeof FieldEditPosts.categrories == 'function') {
						subCategrories = FieldEditPosts.categrories();
						for (const categories of subCategrories) {
							const postEdit = {};
							postEdit['categrories'] = categories;
							// build all edit post
							for (const field of subFields) {
								if (field != 'categrories') {
									postEdit[field] =
										typeof FieldEditPosts[field] !=
										'function'
											? FieldEditPosts[field]
											: FieldEditPosts[field]();
								}
							}
							// EDIT POST
							const response = await PostAction.editPost(
								axiosAPIClient,
								newPostId,
								postEdit,
								testUsers.user1.cookies
							);
							expect(response.status).toBe(200);
							expect(response.statusText).toBe('OK');
							expect(response.data).toMatchObject({
								code: 10001,
								message: 'Edit Successfull',
							});

							// Get Post Infor By Api
							const responseForDetailPost =
								await PostAction.getPostInfor(
									axiosAPIClient,
									newPostId,
									testUsers.user1.cookies
								);
							expect(responseForDetailPost.status).toBe(200);
							expect(responseForDetailPost.statusText).toBe('OK');
							expect(responseForDetailPost.data).toMatchObject({
								code: 10001,
								message: 'Read Success',
							});

							const { metaData } = responseForDetailPost.data;
							expect(
								!postEdit.title ||
									postEdit.title == metaData.title
							).toEqual(true);
							expect(
								!postEdit.statusEdit ||
									postEdit.statusEdit == metaData.statusEdit
							).toEqual(true);
							expect(
								!postEdit.sharePermission ||
									postEdit.sharePermission ==
										metaData.sharePermission
							).toEqual(true);
							expect(
								!postEdit.summarize ||
									postEdit.summarize == metaData.summarize
							).toEqual(true);
							expect(
								!postEdit.content ||
									postEdit.content == metaData.content
							).toEqual(true);
							console.log(postEdit);
							const categoriesLowCase = postEdit.categrories.map(
								(element) => element.toLowerCase()
							);
							console.log(categoriesLowCase);
							console.log(typeof categoriesLowCase);
							console.log(typeof metaData.categrogies);

							console.log(
								categoriesLowCase == metaData.categrogie
							);
							console.log(metaData.categrogies);

							expect(categoriesLowCase).toEqual(
								metaData.categrogies
							);
						}
					}
				}
				else {
					for (const field of subFields) {
						const postEdit = {};
						postEdit[field] =
							typeof FieldEditPosts[field] != 'function'
								? FieldEditPosts[field]
								: FieldEditPosts[field]();
						const response = await PostAction.editPost(
							axiosAPIClient,
							newPostId,
							postEdit,
							testUsers.user1.cookies
						);
						expect(response.status).toBe(200);
						expect(response.statusText).toBe('OK');
						expect(response.data).toMatchObject({
							code: 10001,
							message: 'Edit Successfull',
						});

						// Get Post Infor By Api
						const responseForDetailPost =
							await PostAction.getPostInfor(
								axiosAPIClient,
								newPostId,
								testUsers.user1.cookies
							);
						expect(responseForDetailPost.status).toBe(200);
						expect(responseForDetailPost.statusText).toBe('OK');
						expect(responseForDetailPost.data).toMatchObject({
							code: 10001,
							message: 'Read Success',
						});

						const { metaData } = responseForDetailPost.data;
						expect(
							!postEdit.title || postEdit.title == metaData.title
						).toEqual(true);
						expect(
							!postEdit.statusEdit ||
								postEdit.statusEdit == metaData.statusEdit
						).toEqual(true);
						expect(
							!postEdit.sharePermission ||
								postEdit.sharePermission ==
									metaData.sharePermission
						).toEqual(true);
						expect(
							!postEdit.summarize ||
								postEdit.summarize == metaData.summarize
						).toEqual(true);
						expect(
							!postEdit.content ||
								postEdit.content == metaData.content
						).toEqual(true);
					}
				}
			}
		}, 600000);
	});
});
