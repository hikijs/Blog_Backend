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
};

const CONFIGS = {
	hostname: '127.0.0.1',
	apiUrls: API_ENDPOINTS,
};
module.exports = { CONFIGS };
