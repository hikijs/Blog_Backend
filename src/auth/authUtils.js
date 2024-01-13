const JWT = require('jsonwebtoken');
const { asyncHanlder } = require('../helpers/asyncHandler');
const { BadRequestError, AuthFailureError } = require('../core/error.response');
const VerifyCodeQuery = require('../dbs/verifyCode.mysql');
const { VERIFYCODE_TYPE } = require('../configs/configurations');
const KeyStoreQuery = require('../dbs/keystore.mysql');
const crypto = require('crypto');

const createAsymmetricKeyPair = () => {
	// create key pair publickey and privatekey
	const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		}
	});

	return {privateKey, publicKey};
};

// so that we only use private key
const createTokenPair = async (payload, publicKey, privateKey) => {
	try {
		// create access token by private key
		const accessToken = JWT.sign(payload, privateKey, {
			expiresIn: '2 days',
			algorithm: 'RS256'
		});
		// refresh access token by private key
		const refreshToken = JWT.sign(payload, privateKey, {
			expiresIn: '7 days',
			algorithm: 'RS256'
		});

		JWT.verify(accessToken, publicKey, (err, decode) => {
			if (err) {
				console.error('error verify: ', err);
			} else {
				console.log('decode verify: ', decode);
			}
		});
		return { accessToken, refreshToken };
	} catch (error) {
		console.log(error);
	}
};

const isAuthenticatedUser = async (req) => {
	/*
        1. check userId misisng or not 
        2. get accesstonken
        3. verify token
        4. check user in dbs
        5. check keyStore with user
        6. oke all => return next()
    */
	try {
		const { accessToken, userId } = req.cookies;
		if (!userId || !accessToken) {
			throw new Error('Missing Cookies');
		}
		let keyStore = null;
		keyStore = await KeyStoreQuery.getKeyStore(userId);
		if (keyStore == null) {
			throw new Error('Can not find keyStore');
		}
		const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
		if (userId !== decodeUser.userId) {
			throw new Error('Not Authenticate User');
		}
		req.keyStore = keyStore;
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
};

const authentication = asyncHanlder(async (req, res, next) => {
	try {
		if (!(await isAuthenticatedUser(req))) {
			throw new Error('Invalid Request');
		}
		next();
	} catch (error) {
		throw new AuthFailureError({
			message: 'Invalid Request',
		});
	}
});

// verify code and userId before reset password
const verifyResetPassword = asyncHanlder(async (req, res, next) => {
	const { userId, verifyCode } = req.cookies;
	if (!userId || !verifyCode) {
		throw new BadRequestError({
			message: 'Please provide more input data',
		});
	}
	// verify code should be exist in db
	const codeExisting = await VerifyCodeQuery.checkCodeExistOrNot(
		verifyCode,
		userId,
		VERIFYCODE_TYPE.FORGOT_PASSWORD
	);

	if (codeExisting == null) {
		throw new AuthFailureError({
			message: 'Not correct Code or userID',
		});
	}
	if (codeExisting.expireTime < Date.now()) {
		throw new BadRequestError({
			message: `The verify code timeout 
						${codeExisting.expireTime} < ${new Date(Date.now())}`,
		});
	}

	next();
});

module.exports = {
	createAsymmetricKeyPair,
	createTokenPair,
	authentication,
	verifyResetPassword,
	isAuthenticatedUser,
};
