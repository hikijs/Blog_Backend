'use strict';

const express = require('express');
const router = express.Router();
const { asyncHanlder } = require('../../helpers/asyncHandler');
const { OK } = require('../../core/response/apiSuccessResponse');
require('dotenv').config();
const { postApi } = require('../../helpers/callApi');
router.get(
	'/hooking',
	// eslint-disable-next-line no-unused-vars
	asyncHanlder(async (req, res, next) => {
		console.log(req);
		console.log(req.body);
		const callbackUrl = req.body.callback_url;
		const headers = {
			'Content-type': 'application/json',
			Accept: 'text/plain',
		};
		const data = { state: 'success' };
		const callbackresult = await postApi(callbackUrl, headers, data);
		new OK({
			message: 'Hooking Done',
			metaData: { callbackresult, resBody: req.body },
		}).send(res);
	})
);

module.exports = router;
