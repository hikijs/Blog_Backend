const PREFIX_API = '/v1/api';

const DOMAIN_API = {
	AUTH: '/auth',
	OAUTH: '/oauth',
	UPLOAD: '/upload',
	POST: '/post',
	USER: '/user',
};

const API_ENDPOINTS = {
	SIGNUP: PREFIX_API + DOMAIN_API.AUTH + '/signup',
	LOGIN: PREFIX_API + DOMAIN_API.AUTH + '/login',
	PING: PREFIX_API + DOMAIN_API.AUTH + '/ping',
	GET_SINGLE_POST: PREFIX_API + DOMAIN_API.POST + '/read',
	PUBLISH_POST: PREFIX_API + DOMAIN_API.POST + '/publish_v2',
	EDIT_POST: PREFIX_API + DOMAIN_API.POST + '/edit/',
	DELETE_ALL_POST: PREFIX_API + DOMAIN_API.POST + '/deleteAll/posts?ans=true',
	GET_MY_POSTS: PREFIX_API + DOMAIN_API.POST + '/allMyPost',
	GET_ALL_POSTS: PREFIX_API + DOMAIN_API.POST + '/allPost',
};

const CONFIGS = {
	hostname: '127.0.0.1',
	apiUrls: API_ENDPOINTS,
};
module.exports = { CONFIGS };
