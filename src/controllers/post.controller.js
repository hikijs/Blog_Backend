'use strict';
const { OK, CREATED } = require('../core/response/apiSuccessResponse');

const PostService = require('../services/post.services');
class PostController {
	// eslint-disable-next-line no-unused-vars
	publishPost = async (req, res, next) => {
		const metaData = await PostService.publishPost(req);
		const msg = new OK({
			message: 'Update new Post Success!',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getCategroryList = async (req, res, next) => {
		const metaData = await PostService.getCategoryArray(req);
		const msg = new OK({
			message: 'Get List Category Success!',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	createCategrory = async (req, res, next) => {
		const metaData = await PostService.createCategrory(req);
		const msg = new OK({
			message: 'Create Categrogy Success!',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	publishPostWithThumbnail = async (req, res, next) => {
		const metaData = await PostService.publishPostWithThumbnail(req);
		const msg = new OK({
			message: 'Update new Post With Thumbnail Success!',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	rePublishPost = async (req, res, next) => {
		const metaData = await PostService.rePublishPost(req);
		const msg = new OK({
			message: 'RePublish Post Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	unpublishPost = async (req, res, next) => {
		const metaData = await PostService.unpublishPost(req);
		const msg = new OK({
			message: 'Unpublish Post Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	readSinglePost = async (req, res, next) => {
		const { metaData } = await PostService.readSinglePost(req);
		const msg = new OK({
			message: 'Read Success',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	editPost = async (req, res, next) => {
		const { metaData } = await PostService.editPost(req);
		const msg = new OK({
			message: 'Edit Successfull',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	deletePost = async (req, res, next) => {
		const { metaData } = await PostService.deletePost(req);
		const msg = new OK({
			message: 'Delete Post Successfull',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	deleteAllPost = async (req, res, next) => {
		const { metaData } = await PostService.deleteAllPost(req);
		const msg = new OK({
			message: 'Delete All Successfull',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	commentPost = async (req, res, next) => {
		const { metaData } = await PostService.commentPost(req);
		const msg = new OK({
			message: 'Comment Successful',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	deleteComment = async (req, res, next) => {
		const { metaData } = await PostService.deleteComment(req);
		const msg = new OK({
			message: 'Delete Comment Successful',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getComment = async (req, res, next) => {
		const metaData = await PostService.getComment(req);
		const msg = new OK({
			message: 'Get Comment Successful',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getAllComment = async (req, res, next) => {
		new OK({
			message: 'get all comment success!',
			metaData: await PostService.getAllComment(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	likePost = async (req, res, next) => {
		const { metaData } = await PostService.likePost(req);
		const msg = new OK({
			message: 'Update Like Post Successful',
			metaData: metaData,
		});
		msg.send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getPost = async (req, res, next) => {
		new CREATED({
			message: 'Getting post success!',
			metaData: await PostService.getPost(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getMyPosts = async (req, res, next) => {
		new CREATED({
			message: 'get all post by user id success!',
			metaData: await PostService.getMyPosts(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getAllPost = async (req, res, next) => {
		new CREATED({
			message: 'get all posts (friend posts also) success!',
			metaData: await PostService.getAllPost(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	savePost = async (req, res, next) => {
		new CREATED({
			message: 'save post success',
			metaData: await PostService.savePost(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	unSavePost = async (req, res, next) => {
		new CREATED({
			message: 'unsave post success',
			metaData: await PostService.unSavePost(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getSavePosts = async (req, res, next) => {
		new CREATED({
			message: 'get save post success',
			metaData: await PostService.getSavePosts(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	getSaveListName = async (req, res, next) => {
		new CREATED({
			message: 'Get Name List Saved Success',
			metaData: await PostService.getSaveListName(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	deleteSaveList = async (req, res, next) => {
		new CREATED({
			message: 'Delete save list success',
			metaData: await PostService.deleteSaveList(req),
		}).send(res);
	};
}

module.exports = new PostController();
