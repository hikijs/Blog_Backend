'use strict';
const { OK, CREATED } = require('../core/success.response');

const UploadService = require('../services/upload.services');
class UploadController {
	// eslint-disable-next-line no-unused-vars
	uploadSingleImage = async (req, res, next) => {
		new CREATED({
			message: 'Uploaded a Image Success!',
			metaData: await UploadService.uploadSingleImage(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	uploadMultipleImage = async (req, res, next) => {
		new CREATED({
			message: 'Uploaded Multiple Image Success!',
			metaData: await UploadService.uploadMultipleImage(req),
		}).send(res);
	};

	// eslint-disable-next-line no-unused-vars
	uploadSingleVideo = async (req, res, next) => {
		const videoFile = await UploadService.uploadSingleVideo(req);
		new OK({
			message: 'Upload Video Success',
			metaData: videoFile,
		}).send(res);
	};
}

module.exports = new UploadController();
