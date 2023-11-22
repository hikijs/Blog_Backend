const fs = require('fs');
const FormData = require('form-data');
const { CONFIGS } = require('../config/config');

class PostAction {
	static async publishPost(axiosAPIClient, thumbnailPath, postData, cookies) {
		// Create a new FormData object
		const formData = new FormData();
		// Append data to the FormData object
		formData.append('thumbnail', fs.createReadStream(thumbnailPath));
		formData.append('postData', JSON.stringify(postData));
		const response = await axiosAPIClient.post(
			CONFIGS.apiUrls.PUBLISH_POST,
			formData,
			{
				headers: {
					Cookie: cookies,
					'Content-Type': 'multipart/form-data',
					...formData.getHeaders(),
				},
			}
		);
		return response;
	}

	static async getPostInfor(axiosAPIClient, postId, cookies) {
		const response = await axiosAPIClient.get(
			CONFIGS.apiUrls.GET_SINGLE_POST + '/' + postId,
			{
				headers: {
					Cookie: cookies,
				},
			}
		);
		return response;
	}
}

module.exports = PostAction;
