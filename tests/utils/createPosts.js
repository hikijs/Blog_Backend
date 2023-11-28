/* global expect */
const PostAction = require('./postUtils');

// Fake Post Information

const postDatas = {
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

const MAX_POST_EACH_TYPE = 5;
async function publishPostsForUser(user, axiosAPIClient, thumbnailPath) {
	const numsPrivatePosts = Math.floor(Math.random() * MAX_POST_EACH_TYPE) + 1;
	const numsPublicPosts = Math.floor(Math.random() * MAX_POST_EACH_TYPE) + 1;
	const numFollowerPosts = Math.floor(Math.random() * MAX_POST_EACH_TYPE) + 1;
	const numTotalPosts = numsPrivatePosts + numFollowerPosts + numsPublicPosts;
	// user 1 publish public post 2 private, 1 follower and 4 publicPost
	for (let i = 1; i <= numsPrivatePosts; i++) {
		const privatePost = { ...postDatas.privatePost };
		privatePost.postTitle += `#${i}`;
		const response = await PostAction.publishPost(
			axiosAPIClient,
			thumbnailPath,
			privatePost,
			user.cookies
		);
		expect(response.status).toBe(200);
		expect(response.statusText).toBe('OK');
	}
	for (let i = 1; i <= numsPublicPosts; i++) {
		const publicPost = { ...postDatas.publicPost };
		publicPost.postTitle += `#${i}`;
		const response = await PostAction.publishPost(
			axiosAPIClient,
			thumbnailPath,
			publicPost,
			user.cookies
		);
		expect(response.status).toBe(200);
		expect(response.statusText).toBe('OK');
	}
	for (let i = 1; i <= numFollowerPosts; i++) {
		const followerPost = { ...postDatas.followerPost };
		followerPost.postTitle += `#${i}`;
		const response = await PostAction.publishPost(
			axiosAPIClient,
			thumbnailPath,
			followerPost,
			user.cookies
		);
		expect(response.status).toBe(200);
		expect(response.statusText).toBe('OK');
	}

	return {
		author: user.username,
		numTotalPosts,
		numsPrivatePosts,
		numFollowerPosts,
		numsPublicPosts,
	};
}

module.exports = { publishPostsForUser };
