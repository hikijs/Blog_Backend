class OverviewPost {
	constructor() {
		this.publishExecutionInfors = {};
	}

	addPublishPostForUser(user, postInfo) {
		this.publishExecutionInfors[user] = postInfo;
	}

	cleanPostInforForUser(user) {
		this.publishExecutionInfors[user] = {};
	}

	getSummarizePostPublish4User(key) {
		return this.publishExecutionInfors[key];
	}

	getFullInfor() {
		return this.publishExecutionInfors;
	}

	getNumsUserPublishPost() {
		return Object.keys(this.publishExecutionInfors).length;
	}

	cleanUp() {
		this.publishExecutionInfors = {};
	}

	getPostInforByUser(user, type) {
		if (Object.keys(this.publishExecutionInfors[user]).length === 0) {
			return 0;
		}
		switch (type) {
			case 'public':
				return this.publishExecutionInfors[user].numsPublicPosts;
			case 'private':
				return this.publishExecutionInfors[user].numsPrivatePosts;
			case 'follower':
				return this.publishExecutionInfors[user].numFollowerPosts;
			case 'all':
				return this.publishExecutionInfors[user].numTotalPosts;
			default:
				throw new Error(
					'TEST: Failure Happen In Getting Post For User'
				);
		}
	}
	getTotalPublicPosts() {
		let result = 0;
		for (const key in this.publishExecutionInfors) {
			result += this.publishExecutionInfors[key].numsPublicPosts || 0;
		}
		return result;
	}

	getTotalPrivatePosts() {
		let result = 0;
		for (const key in this.publishExecutionInfors) {
			result += this.publishExecutionInfors[key].numsPrivatePosts || 0;
		}
		return result;
	}

	getTotalFollowerPosts() {
		let result = 0;
		for (const key in this.publishExecutionInfors) {
			result += this.publishExecutionInfors[key].numFollowerPosts || 0;
		}
		return result;
	}
}

module.exports = { OverviewPost };
