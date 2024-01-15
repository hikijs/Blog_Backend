'use strict';

const express = require('express');
const router = express.Router();
const { asyncHanlder } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const FriendController = require('../../controllers/friend.controller');
require('dotenv').config();

router.use(authentication);
router.get('/friends', asyncHanlder(FriendController.getMyFriends));

router.post(
	'/request/:userId',
	asyncHanlder(FriendController.friendRequest)
);
router.get('/incomming-requests', asyncHanlder(FriendController.getIncommingFriendRequest));
router.get('/outgoing-requests', asyncHanlder(FriendController.getOutgoingFriendRequest));
router.post(
	'/answere_request/:requesterId',
	asyncHanlder(FriendController.answereRequest)
);
router.delete('/unfriend/:friendId', asyncHanlder(FriendController.unfriend));

router.get(
	'/recommend-followings',
	asyncHanlder(FriendController.getRecommendFollowings)
);


module.exports = router;
