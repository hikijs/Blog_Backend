'use strict';

const express = require('express');
const router = express.Router();
const { asyncHanlder } = require('../../helpers/asyncHandler');
const accessController = require('../../controllers/access.controller');
const { authentication, verifyResetPassword } = require('../../auth/authUtils');
const Validator = require('../../middelwares/validator');
const AuthenticaseBasicSchema = require('./authenticationTemplate');
require('dotenv').config();
// signup
router.post(
	'/signup',
	Validator(AuthenticaseBasicSchema.SIGNUP),
	asyncHanlder(accessController.signUp)
);
//login
router.post('/login', asyncHanlder(accessController.login));

router.put('/password',
	Validator(AuthenticaseBasicSchema.PASSWORD), 
	asyncHanlder(accessController.updatePassword));

router.use(authentication);
router.get('/ping', asyncHanlder(accessController.ping));
router.delete('/logout', asyncHanlder(accessController.logout));

module.exports = router;
