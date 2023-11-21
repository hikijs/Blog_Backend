const { v4: uuidv4 } = require('uuid');

const SqlBuilder = require('../utils/sqlBuilder');
const QueryBase = require('./queryBase');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { InternalCode } = require('../core/response/responseConfig');
class PostSummarizeContent {
	constructor(postData, index) {
		const {
			postId,
			title,
			summarize,
			created_at,
			updated_at,
			userId,
			userName,
			avatarUrl,
			thumbnailUrl,
			categoryNames,
			statusEdit,
			sharePermission,
		} = postData;
		this.index = index;
		this.postId = postId;
		this.title = title;
		this.summarize = summarize;
		this.created_at = created_at;
		this.updated_at = updated_at;
		this.userId = userId;
		this.userName = userName;
		this.avatarUrl = avatarUrl;
		this.thumbnailUrl = thumbnailUrl;
		this.categoryNames = categoryNames.split(',');
		this.statusEdit = statusEdit;
		this.sharePermission = sharePermission;
	}

	getSantilizedPostData() {
		const { userId, userName, avatarUrl } = this;
		const {
			postId,
			title,
			summarize,
			thumbnailUrl,
			created_at,
			updated_at,
			categoryNames,
			statusEdit,
			sharePermission,
		} = this;

		return {
			index: this.index,
			author: {
				userId,
				userName,
				avatar: avatarUrl,
			},
			postData: {
				postId,
				title,
				summarize,
				statusEdit,
				sharePermission,
				thumbnail: thumbnailUrl,
				categoryNames,
				created_at,
				updated_at,
			},
		};
	}
}
class PostQuery extends QueryBase {
	constructor() {
		super();
	}
	async insertPostToDb(
		title,
		statusEdit,
		sharePermit,
		summarize,
		content,
		userId
	) {
		try {
			const postId = uuidv4();
			const query =
				'INSERT INTO POST (postId, title, statusEdit, sharePermission , summarize,\
                       content, userId) \
                       VALUES (?, ?, ?, ?, ?, ?, ?)';
			await this.dbInstance.hitQuery(query, [
				postId,
				title,
				statusEdit,
				sharePermit,
				summarize,
				content,
				userId,
			]);
			return postId;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async updatePostCategoryTable(postId, categroryId) {
		const checkQuery =
			'SELECT COUNT(*) AS count FROM POSTCATEGORY WHERE postId = ? AND categroryId = ?';
		const result = await this.dbInstance.hitQuery(checkQuery, [
			postId,
			categroryId,
		]);
		if (result[0].count > 0) {
			console.log('Do not need update categrory');
		} else {
			const updatePostCategory =
				'INSERT INTO POSTCATEGORY (postId, categroryId) VALUES (?, ?)';
			await this.dbInstance.hitQuery(updatePostCategory, [
				postId,
				categroryId,
			]);
		}
	}

	async updatePost(queriesData, postId) {
		const { query, queryParams } =
			SqlBuilder.dynamicSqlForUpdatePostByPostId(queriesData, postId);
		await this.dbInstance.hitQuery(query, queryParams);
	}

	async deletePost(postId) {
		const query = 'DELETE FROM POST WHERE postId = ?';
		return await this.dbInstance.hitQuery(query, [postId]);
	}

	async deletePostByUser(userId) {
		const query = 'DELETE FROM POST WHERE userId = ?';
		return await this.dbInstance.hitQuery(query, [userId]);
	}

	async getPostByPostId(postId) {
		try {
			// Get post infor without categrory
			const getPost = ` SELECT  U.userId, U.userName, I1.imageUrl as avatarUrl,
                                  P.postId, I2.imageUrl as thumbnailUrl, P.title,
                                  P.statusEdit, P.sharePermission, P.summarize, P.content, P.created_at, P.updated_at
                          FROM POST P
                          INNER JOIN USER U
                          	ON P.userId = U.userId
                          LEFT JOIN IMAGE I1
                          	ON I1.userId = P.userId AND I1.topic = 'avatar'
                          LEFT JOIN IMAGE I2
                          	ON I2.postId = P.postId AND I2.topic = 'thumnail'
                          WHERE P.postId  = ?;`;
			const postData = await this.dbInstance.hitQuery(getPost, [postId]);
			// get list categrory of by postId
			const categrogiesData = await this.getCategroryListByPostId(postId);
			if (postData.length == 1) {
				return { ...postData[0], categrogies: categrogiesData };
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async getCategroryList() {
		try {
			const query = 'SELECT categroryName FROM CATEGORY';
			const listCategrory = await this.dbInstance.hitQuery(query);
			return listCategrory;
		} catch (error) {
			console.error(error);
			throw new BadRequestError({
				message: 'Issue happen when getting categrory',
			});
		}
	}

	async getCategroryListByPostId(postId) {
		try {
			const query = `SELECT C.categroryName
						FROM POSTCATEGORY PC
						INNER JOIN CATEGORY C
						ON PC.categroryId = C.categroryId
						WHERE postId = ?`;
			const listCategrory = await this.dbInstance.hitQuery(query, [
				postId,
			]);
			return listCategrory.map((category) => category.categroryName);
		} catch (error) {
			console.error(error);
			throw new BadRequestError({
				message: 'Issue happen when getting post categrogies',
			});
		}
	}

	async createCategory(categroryName) {
		try {
			const query = `INSERT INTO CATEGORY (categroryId, categroryName) 
			               VALUES ( UUID(), ? )`;
			const createResult = await this.dbInstance.hitQuery(query, [
				categroryName,
			]);
			return createResult;
		} catch (error) {
			console.error(error);
			throw new BadRequestError({
				message: 'Issue happen when create new categrory',
			});
		}
	}

	async createTempTablePostWithListCategrory() {
		//Note: temporary table existence on same db connection only
		const joinPostWithCategrory = `
		CREATE TEMPORARY TABLE POST_AND_CATEGRORIES AS
			SELECT
				P.postId,
				GROUP_CONCAT(C.categroryName) AS categoryNames
			FROM
				POSTCATEGORY AS PC
			JOIN
				POST AS P ON PC.postId = P.postId
			JOIN
				CATEGORY AS C ON PC.categroryId = C.categroryId
			GROUP BY
				P.postId;`;
		await this.dbInstance.hitQuery(joinPostWithCategrory);
	}

	async getPostByUserId(userId, numberPosts) {
		await this.createTempTablePostWithListCategrory();
		const getPost = `SELECT
						P.postId,
						I1.imageUrl AS thumbnailUrl,
						P.title,
						PAC.categoryNames,
						P.statusEdit,
						P.sharePermission,
						P.summarize,
						P.created_at,
						P.updated_at,
						U.userId, 
						U.userName,
						I2.imageUrl AS avatarUrl
					FROM
						POST_AND_CATEGRORIES PAC
					INNER JOIN POST P 
						ON P.postId = PAC.postId
					JOIN USER U
					    ON P.userId = U.userId
					LEFT JOIN IMAGE I1
						ON U.userId = I1.postId AND I1.topic = 'thumnail'
					LEFT JOIN IMAGE I2
						ON P.postId = I2.userId AND I2.topic = 'avatar'
					WHERE
						P.userId = ?
					ORDER BY
					P.created_at DESC;`;
		const postData = await this.dbInstance.hitQuery(getPost, [userId]);
		console.log(postData);
		if (postData.length == numberPosts) {
			let postSummarizeContents = [];
			let index = 0;
			postData.forEach((element) => {
				let postSummarize = new PostSummarizeContent(element, index);
				postSummarizeContents.push(
					postSummarize.getSantilizedPostData()
				);
				index = index + 1;
			});
			return postSummarizeContents;
		} else {
			throw new NotFoundError({
				message: 'Conflict Happen When Getting All Posts',
				internalCode: InternalCode.NOT_FOUND,
			});
		}
	}

	async getPostByUserIdV2(userId, numberPosts) {
		await this.createTempTablePostWithListCategrory();
		const getPostDataQuery = `SELECT
		  P.postId,
		  I1.imageUrl AS thumbnailUrl,
		  P.title,
		  PAC.categoryNames,
		  P.statusEdit,
		  P.sharePermission,
		  P.summarize,
		  P.created_at,
		  P.updated_at,
		  U1.userId,
		  U1.userName,
		  I2.imageUrl AS avatarUrl
		FROM
			POST_AND_CATEGRORIES PAC
		INNER JOIN POST P 
			ON P.postId = PAC.postId
		LEFT JOIN USER AS U1
			ON U1.userId = P.userId
		LEFT JOIN IMAGE AS I1
			ON P.postId = I1.postId and I1.topic='thumnail'
		LEFT JOIN IMAGE AS I2
			ON P.userId = I2.userId and I2.topic='avatar'
		LEFT JOIN FRIENDSHIPS AS F
			ON F.userAId = U1.userId AND F.userBId = ?
		WHERE   (
			P.statusEdit = 'publish'
			AND P.sharePermission = 'follower'
			AND F.userBId = ?
		)
		OR (
			P.statusEdit = 'publish'
			AND P.sharePermission = 'public'
		)
		OR U1.userId = ?
		ORDER BY P.updated_at DESC;`;
		const postData = await this.dbInstance.hitQuery(getPostDataQuery, [
			userId,
			userId,
			userId,
		]);
		if (postData.length == numberPosts) {
			let postSummarizeContents = [];
			let index = 0;
			postData.forEach((element) => {
				let postSummarize = new PostSummarizeContent(element, index);
				postSummarizeContents.push(
					postSummarize.getSantilizedPostData()
				);
				index = index + 1;
			});
			return postSummarizeContents;
		} else {
			throw new NotFoundError({
				message: 'Conflict Happen When Getting My Posts',
				internalCode: InternalCode.NOT_FOUND,
			});
		}
	}

	async getNumberPostOfUser(userId) {
		const numsPostQuery =
			'SELECT COUNT(*) AS numberPost FROM POST WHERE userId = ?';
		const result = await this.dbInstance.hitQuery(numsPostQuery, [userId]);
		console.log(result);
		return result[0]['numberPost'];
	}

	async getNumberPostFollowedByUser(userId) {
		try {
			const numsPostQuery = `SELECT COUNT(*) as numberPost
                                FROM POST P 
                                LEFT JOIN USER AS U1 ON U1.userId = P.userId
                                LEFT JOIN IMAGE AS I1 ON P.postId = I1.postId and I1.topic='thumnail'
                                LEFT JOIN IMAGE AS I2 ON P.userId = I2.userId and I2.topic='avatar'
                                LEFT JOIN FRIENDSHIPS AS F ON F.userAId = U1.userId AND F.userBId = ?
                                WHERE   (
									P.statusEdit = 'publish'
									AND P.sharePermission = 'follower'
									AND F.userBId = ?
								)
								OR (
									P.statusEdit = 'publish'
									AND P.sharePermission = 'public'
								)
								OR U1.userId = ?;`;
			const result = await this.dbInstance.hitQuery(numsPostQuery, [
				userId,
				userId,
				userId,
			]);
			console.log(result);
			return result[0]['numberPost'];
		} catch (error) {
			return null;
		}
	}

	async isUserCanReadPost(userId, postId) {
		try {
			const query = ` SELECT COUNT(*) as totalRecords
                                FROM POST P
                                LEFT JOIN FRIENDSHIPS F 
                                ON P.userId = F.userAId AND F.userBId =  ?
                                WHERE ((userId= ?)
                                        OR (sharePermission ='public' AND statusEdit ='publish')
                                        OR (P.userId = F.userAId AND sharePermission = 'follower' AND statusEdit ='publish'))
                                        AND postId = ?;`;
			const checkResult = await this.dbInstance.hitQuery(query, [
				userId,
				userId,
				postId,
			]);
			if (checkResult[0]['totalRecords'] == 1) {
				return true;
			} else {
				console.error(
					`The user ${userId} does not have a right access to post ${postId}`
				);
				return false;
			}
		} catch (error) {
			throw new BadRequestError({
				message: 'Issue when getting post',
			});
		}
	}

	// FIXME I think getCategrory should not is the method of the class
	async getCategrory(categroryName) {
		try {
			const query = 'SELECT * FROM CATEGORY WHERE categroryName = ? ';
			const result = await this.dbInstance.hitQuery(query, [
				categroryName,
			]);
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			return null;
		}
	}

	async updatePostStatus(status, postId) {
		const query = 'UPDATE POST SET statusEdit = ? WHERE postId = ?';
		const result = await this.dbInstance.hitQuery(query, [status, postId]);
		if (result.affectedRows == 0) {
			throw new Error('No PostId was updated to unpublish');
		}
	}

	async upSertCommentForPost(
		commentText,
		postId,
		userId,
		parentCommentId,
		commendId
	) {
		if (commendId) {
			const query =
				'UPDATE COMMENT SET commentText = ?, postId = ?, userId = ?, parentCommentId=? WHERE commentId = ?';
			const result = await this.dbInstance.hitQuery(query, [
				commentText,
				postId,
				userId,
				parentCommentId,
				commendId,
			]);
			if (result.affectedRows == 0) {
				throw new Error('No Comment was updated');
			}
		} else {
			const query =
				'INSERT INTO COMMENT  (commentId, commentText, postId, userId, parentCommentId) \
                       VALUES(UUID(), ?, ?, ?, ?)';
			const result = await this.dbInstance.hitQuery(query, [
				commentText,
				postId,
				userId,
				parentCommentId,
			]);
			if (result.affectedRows != 1) {
				throw new Error('Can not insert new comment');
			}
		}
	}

	async upSertLikeForPost(postId, userId) {
		const checkQuery =
			'SELECT * FROM LIKE_EMOTION WHERE postId = ? AND userId = ?';
		var result = await this.dbInstance.hitQuery(checkQuery, [
			postId,
			userId,
		]);
		if (result.length == 1) {
			console.log(`Dislike Post ${postId}`);
			const deleteLikeQuery = 'DELETE FROM LIKE_EMOTION WHERE likeId = ?';
			result = await this.dbInstance.hitQuery(deleteLikeQuery, [
				result[0].likeId,
			]);
			if (result.affectedRows != 1) {
				throw new Error('Can not DisLike Post');
			}
		} else {
			console.log(`Like Post ${postId}`);
			const updateLike =
				'INSERT INTO LIKE_EMOTION (likeId, postId, userId) VALUES (UUID(), ?, ?)';
			result = await this.dbInstance.hitQuery(updateLike, [
				postId,
				userId,
			]);
			if (result.affectedRows != 1) {
				throw new Error('Can not Like Post');
			}
		}
	}

	// FIXME I think getCommentById should not is the method of the class
	async getCommentById(commentId) {
		try {
			const getCommentSql =
				'SELECT commentId, commentText, userId FROM COMMENT WHERE commentId = ?';
			const commentData = await this.dbInstance.hitQuery(getCommentSql, [
				commentId,
			]);
			if (commentData.length == 1) {
				return commentData[0];
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async getCommentByParentId(parentCommentId) {
		try {
			const getCommentSql =
				'SELECT commentId, commentText, userId, updated_at, created_at FROM COMMENT \
                               WHERE parentCommentId = ? \
                               ORDER BY created_at DESC';
			const commentData = await this.dbInstance.hitQuery(getCommentSql, [
				parentCommentId,
			]);
			if (commentData.length > 0) {
				return commentData;
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async getCommentByPostId(postId, hiddenSubComment = true) {
		try {
			const appendQuery = hiddenSubComment
				? ' AND parentCommentId IS NULL '
				: '';
			const getCommentSql = `SELECT commentId, commentText, userId, updated_at, created_at FROM COMMENT \
                               WHERE postId = ? ${appendQuery}\
                               ORDER BY created_at DESC`;
			const commentData = await this.dbInstance.hitQuery(getCommentSql, [
				postId,
			]);
			console.log(commentData);
			if (commentData.length > 0) {
				return commentData;
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	// FIXME I think deleteComment should not is the method of the class
	async deleteComment(commentId, userId) {
		try {
			const deleteCommentSql =
				'DELETE FROM COMMENT WHERE commentId = ?  AND userId = ?';
			const commentData = await this.dbInstance.hitQuery(
				deleteCommentSql,
				[commentId, userId]
			);
			console.log(commentData);
			if (commentData.affectedRows == 1) {
				return commentData;
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async updateCategoryForPost(categroryList, postId) {
		for (const categroryName of categroryList) {
			const categoryData = await this.getCategrory(
				categroryName.toLowerCase()
			);
			if (categoryData == null) {
				throw new BadRequestError({
					message: 'Please Double Check Your Category Name',
				});
			}
			await this.updatePostCategoryTable(
				postId,
				categoryData.categroryId
			);
		}
	}

	async clearAllCategroryForPost(postId) {
		const deleteAllCategrory = 'DELETE FROM POSTCATEGORY WHERE postId = ?';
		const deleteResult = await this.dbInstance.hitQuery(
			deleteAllCategrory,
			[postId]
		);
		return deleteResult;
	}
}

module.exports = new PostQuery();
