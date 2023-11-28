const fs = require('fs');
const FormData = require('form-data');
const { CONFIGS } = require('../config/config');
let PostIndex = 1;
class PostAction {
	static async publishPost(axiosAPIClient, thumbnailPath, postData, cookies) {
		console.log(`=====>>>> CREATE A NEW POST ${PostIndex++}`);
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

	static async editPost(axiosAPIClient, postId, editPostData, cookies) {
		console.log('=====>>>> EDIT A POST');
		const response = await axiosAPIClient.put(
			CONFIGS.apiUrls.EDIT_POST + postId,
			editPostData,
			{
				headers: {
					Cookie: cookies,
				},
			}
		);
		return response;
	}

	static async deleteAllPost(axiosAPIClient, cookies) {
		const response = await axiosAPIClient.delete(
			CONFIGS.apiUrls.DELETE_ALL_POST,
			{
				headers: {
					Cookie: cookies,
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

	static async getAllMyPost(axiosAPIClient, cookies) {
		const response = await axiosAPIClient.get(
			CONFIGS.apiUrls.GET_MY_POSTS,
			{
				headers: {
					Cookie: cookies,
				},
			}
		);
		return response;
	}

	static async getAllPost(axiosAPIClient, cookies) {
		const response = await axiosAPIClient.get(
			CONFIGS.apiUrls.GET_ALL_POSTS,
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
