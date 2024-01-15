'use strict';

const express = require('express');
const router = express.Router();
const { asyncHanlder } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const UserController = require('../../controllers/user.controller');
require('dotenv').config();

router.use(authentication);

// get my profile
router.get('/my-profile', asyncHanlder(UserController.getMyProfile));

router.post('/request-email-verification', asyncHanlder(UserController.verifyEmailForUser));
router.post(
	'/verification-email',
	asyncHanlder(UserController.executeVerifyEmailForUser)
);

// notify
router.get('/notifies', asyncHanlder(UserController.getAllNotify));
// FIXME
// the name of routes does not good till now, should change and move these routes
// to other group
router.put(
	'/receivedNotifies',
	asyncHanlder(UserController.setReceivedNotifies)
);
router.put('/readNotify/:notifyId', asyncHanlder(UserController.readNotify));

// general routes should be here
router.get('/:userId', asyncHanlder(UserController.getUserInfo));
router.put('/:userId', asyncHanlder(UserController.updateProfile));
router.delete('/:userId', asyncHanlder(UserController.deleteProfile));

module.exports = router;
