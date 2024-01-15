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

// friend request
router.post(
	'/friend_request/:friendId',
	asyncHanlder(UserController.friendRequest)
);

router.post(
	'/answere_request/:requesterId',
	asyncHanlder(UserController.answereRequest)
);
router.get('/friend_requests', asyncHanlder(UserController.getFriendRequest));
router.delete('/unfriend/:friendId', asyncHanlder(UserController.unfriend));
router.get('/myFriends', asyncHanlder(UserController.getMyFriends));

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

// FIXME should change the name of recommend follower
router.get(
	'/recommendFollowing',
	asyncHanlder(UserController.getRecommendFollowings)
);

// general routes should be here
router.get('/:userId', asyncHanlder(UserController.getUserInfo));
router.put('/:userId', asyncHanlder(UserController.updateProfile));
router.delete('/:userId', asyncHanlder(UserController.deleteProfile));

module.exports = router;
