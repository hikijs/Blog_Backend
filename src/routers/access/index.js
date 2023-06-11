'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const accessController = require('../../controllers/access.controller')
const { authentication, verifyResetPassword } = require('../../auth/authUtils')
require('dotenv').config()
// signup
router.post('/signup', asyncHanlder(accessController.signUp))
//login
router.post('/login', asyncHanlder(accessController.login))
// forgot password
router.post('/forgot-password/:verifyCode', asyncHanlder(accessController.forgotPasswordVerify))
router.post('/forgot-password', asyncHanlder(accessController.forgotPassword))
router.post('/reset-password', verifyResetPassword, asyncHanlder(accessController.resetPassword))

router.use(authentication)
// logout
router.get('/ping', asyncHanlder(accessController.ping))
router.post('/logout', asyncHanlder(accessController.logout))


module.exports = router