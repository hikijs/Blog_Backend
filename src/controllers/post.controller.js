'use strict'
const instanceMySqlDB = require('../dbs/init.mysql')
const {OK, CREATED} = require('../core/success.response')

const PostService = require('../services/post.services')
class PostController
{
    publishPost = async (req, res, next) => {
        const metaData = await PostService.publishPost(req)
        const msg = new OK({
            message: "Update new Post Success!",
            metaData: metaData
        })
        msg.send(res)
    }

    getCategoryList = async (req, res, next) => {
        const metaData = await PostService.getCategoryList(req)
        const msg = new OK({
            message: "Get List Category Success!",
            metaData: metaData
        })
        msg.send(res)
    }

    publishPostWithThumbnail = async (req, res, next) => {
        const metaData = await PostService.publishPostWithThumbnail(req)
        const msg = new OK({
            message: "Update new Post With Thumbnail Success!",
            metaData: metaData
        })
        msg.send(res)
    }

    rePublishPost = async (req, res, next) => {
        const metaData = await PostService.rePublishPost(req)
        const msg = new OK({
            message: "RePublish Post Success",
            metaData: metaData
        })
        msg.send(res)
    }

    unpublishPost = async (req, res, next) => {
        const metaData = await PostService.unpublishPost(req)
        const msg = new OK({
            message: "Unpublish Post Success",
            metaData: metaData
        })
        msg.send(res)
    }

    readSinglePost = async (req, res, next) => {
        const {metaData} = await PostService.readSinglePost(req)
        const msg = new OK({
            message: "Read Success",
            metaData: metaData
        })
        msg.send(res)
    }

    editPost = async (req, res, next) => {
        const {metaData} = await PostService.editPost(req)
        const msg = new OK({
            message: "Edit Successfull",
            metaData: metaData
        })
        msg.send(res)
    }
    
    deletePost = async (req, res, next) => {
        const {metaData} = await PostService.deletePost(req)
        const msg = new OK({
            message: "Delete Post Successfull",
            metaData: metaData
        })
        msg.send(res)
    }

    deleteAllPost = async (req, res, next) => {
        const {metaData} = await PostService.deleteAllPost(req)
        const msg = new OK({
            message: "Delete All Successfull",
            metaData: metaData
        })
        msg.send(res)
    }

    commentPost = async (req, res, next) => {
        const {metaData} = await PostService.commentPost(req)
        const msg = new OK({
            message: "Comment Successful",
            metaData: metaData
        })
        msg.send(res)
    }

    deleteComment = async (req, res, next) => {
        const {metaData} = await PostService.deleteComment(req)
        const msg = new OK({
            message: "Delete Comment Successful",
            metaData: metaData
        })
        msg.send(res)
    }

    getComment = async (req, res, next) => {
        const metaData = await PostService.getComment(req)
        const msg = new OK({
            message: "Get Comment Successful",
            metaData: metaData
        })
        msg.send(res)
    }

    getAllComment = async (req, res, next) => {
        new OK({
            message: "get all comment success!",
            metaData: await PostService.getAllComment(req)
        }).send(res)
    }


    likePost = async (req, res, next) => {
        const {metaData} = await PostService.likePost(req)
        const msg = new OK({
            message: "Update Like Post Successful",
            metaData: metaData
        })
        msg.send(res)
    }
    // POST http://localhost:3055/post/postId
    getPost = async (req, res, next) => {
        new CREATED({
            message: "Getting post success!",
            metaData: await PostService.getPost(req)
        }).send(res)
    }
    // POST http://localhost:3055/post/allpost
    getMyPosts = async (req, res, next) => {
        new CREATED({
            message: "get all post by user id success!",
            metaData: await PostService.getMyPosts(req)
        }).send(res)
    }

    getAllPost = async (req, res, next) => {
        new CREATED({
            message: "get all posts (friend posts also) success!",
            metaData: await PostService.getAllPost(req)
        }).send(res)
    }

    savePost = async (req, res, next) => {
        new CREATED({
            message: "save post success",
            metaData: await PostService.savePost(req)
        }).send(res)
    }

    unSavePost = async (req, res, next) => {
        new CREATED({
            message: "unsave post success",
            metaData: await PostService.unSavePost(req)
        }).send(res)
    }

    getSavePosts = async (req, res, next) => {
        new CREATED({
            message: "get save post success",
            metaData: await PostService.getSavePosts(req)
        }).send(res)
    }

    getSaveListName = async (req, res, next) => {
        new CREATED({
            message: "Get Name List Saved Success",
            metaData: await PostService.getSaveListName(req)
        }).send(res)
    }

    deleteSaveList = async (req, res, next) => {
        new CREATED({
            message: "Delete save list success",
            metaData: await PostService.deleteSaveList(req)
        }).send(res)
    }
    
}

module.exports = new PostController()