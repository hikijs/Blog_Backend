const { BadRequestError, AuthFailureError } = require('../core/error.response');
const ImageData = require('../dbs/image.mysql');

const AVATAR_TOPIC = ['avatar', 'thumnail', 'content'];

class UploadService {
	static uploadSingleImage = async (req) => {
		/// Image file is stored in req.file
		let userId = req.cookies.userId;
		let { topic, postId } = req.query;
		if (!userId) {
			throw new AuthFailureError({
				message: 'Please verify your authentication',
			});
		}
		if (!AVATAR_TOPIC.includes(topic)) {
			throw new BadRequestError({
				message: 'Please give correct topic',
			});
		} else if (topic == 'thumnail' && !postId) {
			{
				throw new BadRequestError({
					message: 'Please give infor of post',
				});
			}
		}
		const { filename } = req.file;
		console.log(filename);
		// Generate blob link
		const blobLink =
			req.protocol + '://' + req.get('host') + '/images/' + filename;
		await ImageData.insertImageToDb(blobLink, topic, userId, postId);
		return blobLink;
	};

	// FIXME
	// if move url image from content to thumbnail that lead to in the future when 
	// query the list image of the content will miss the once which was converted
	// to thumbnail
	static uploadImageUrl = async (req) => {
		let userId = req.cookies.userId;
		let { topic, postId } = req.query;
		let { url } = req.body;
		if (!userId) {
			throw new AuthFailureError({
				message: 'Please verify your authentication',
			});
		}
		if (!url) {
			throw new BadRequestError({
				message: 'Please Giving The Image Url',
			});
		}
		if (!AVATAR_TOPIC.includes(topic)) {
			throw new BadRequestError({
				message: 'Please give correct topic',
			});
		} else if (topic == 'thumnail' && !postId) {
			{
				throw new BadRequestError({
					message: 'Please give infor of post',
				});
			}
		}
		await ImageData.insertImageToDb(url, topic, userId, postId);
		return url;
	};

	static uploadMultipleImage = async (req) => {
		console.log('Uploading many files');
		// Array of image files is stored in req.files
		const blobLinks = [];

		// Process each file
		req.files.forEach((file) => {
			const { filename } = file;

			// Generate blob link
			const blobLink =
				req.protocol + '://' + req.get('host') + '/uploads/' + filename;
			blobLinks.push(blobLink);

			// Perform any additional operations (e.g., storing in the database)
		});

		// Send the blob links back to the client
		return blobLinks;
	};

	static uploadSingleVideo = async (req) => {
		/// Image file is stored in req.file
		const { filename } = req.file;
		// console.log(filename)
		// Generate blob link
		const blobLink =
			req.protocol + '://' + req.get('host') + '/videos/' + filename;

		// Send the blob link back to the client
		console.log(blobLink);
		// const newImage = await ImageData.insertImageToDb(blobLink,'avatar',req.headers['userid'], null)
		// console.log(newImage)
		return blobLink;
	};
}

module.exports = UploadService;
