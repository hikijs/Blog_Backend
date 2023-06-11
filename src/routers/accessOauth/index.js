'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const accessController = require('../../controllers/access.controller')


//when the google login success full this endpoint will be triggered
router.get('/google/login', asyncHanlder(accessController.googleLogin))
router.get('/google/callback/login', asyncHanlder(accessController.callbackGoogleLogin))

router.get('/facebook/login', asyncHanlder(accessController.facebookLogin))
router.get('/facebook/callback/login', asyncHanlder(accessController.callbackFacebookLogin))

router.get('/github/login', asyncHanlder(accessController.githubLogin))
router.get('/github/callback/login', asyncHanlder(accessController.callbackGithubLogin))

module.exports = router