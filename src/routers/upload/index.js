'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const UploadController = require('../../controllers/upload.controller')
const { authentication } = require('../../auth/authUtils');
const { imageUpload, videoUpload }= require('../../helpers/uploadMulter')
require('dotenv').config()
if(process.env.OFF_AUTHEN == true)
{
    router.use(authentication)
}
// upload and get images
router.post('/image', imageUpload.single('image'), asyncHanlder(UploadController.uploadSingleImage))
router.post('/images', imageUpload.array('images'), asyncHanlder(UploadController.uploadMultipleImage))

// upload video
router.post('/video', videoUpload.single('video'),  asyncHanlder(UploadController.uploadSingleVideo))

// upload video
// router.post('/video', )

module.exports = router