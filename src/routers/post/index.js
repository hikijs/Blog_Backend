'use strict'

const express = require('express')
const router = express.Router()
const {asyncHanlder} = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const PostController = require('../../controllers/post.controller')
const {imageUpload} = require('../../helpers/uploadMulter')
const { getMaxListeners } = require('nodemailer/lib/xoauth2')
require('dotenv').config()

router.use(authentication)

router.get('/catetogies', asyncHanlder(PostController.getCategoryList))
router.post('/publish', asyncHanlder(PostController.publishPost))
router.post('/publish_v2', imageUpload.single('thumbnail'),  asyncHanlder(PostController.publishPostWithThumbnail))
router.put('/republish/:postId', asyncHanlder(PostController.rePublishPost))
router.put('/unpublish/:postId', asyncHanlder(PostController.unpublishPost))

router.get('/read/:postId', asyncHanlder(PostController.readSinglePost))
// FIXME the categrory can be multiple value, how to edit
router.put('/edit/:postId', asyncHanlder(PostController.editPost))
router.delete('/delete/:postId', asyncHanlder(PostController.deletePost))
router.delete('/delete/posts', asyncHanlder(PostController.deleteAllPost))

// router.post('/delete/:postId', asyncHanlder(PostController.editComment))
// FIXME the comment just is basic, in the future hard to development, should spend time refactor
router.post('/comment/put/:postId', asyncHanlder(PostController.commentPost))
router.delete('/comment/delete/:commentId', asyncHanlder(PostController.deleteComment))
router.get('/comment/get/:postId', asyncHanlder(PostController.getComment))
// get all comments and subcomment
router.get('/comment/getAll/:postId', asyncHanlder(PostController.getAllComment))


router.post('/like/:postId', asyncHanlder(PostController.likePost))
// router.post('/save-change/:postId', asyncHanlder(PostController.updatePost)) // save in draf style
// router.post('/delta/:postId', asyncHanlder(PostController.updatePost))
// router.post('/add-reading-list/:postId', asyncHanlder(PostController.updatePost))

router.get('/allMyPost', asyncHanlder(PostController.getMyPosts))
router.get('/allPost', asyncHanlder(PostController.getAllPost))
// router.get('/:postId', asyncHanlder(PostController.getPost))


router.post('/savePost', asyncHanlder(PostController.savePost))
router.get('/savePosts/:saveListId', asyncHanlder(PostController.getSavePosts))
router.delete('/unSavePost/:saveListId/:postId', asyncHanlder(PostController.unSavePost))
router.get('/saveLists',asyncHanlder(PostController.getSaveListName))
router.delete('/saveList/:saveListId',asyncHanlder(PostController.deleteSaveList))




module.exports = router