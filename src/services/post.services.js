const instanceMySqlDB = require('../dbs/init.mysql')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const path = require('path');
const PostQuery = require('../dbs/post.mysql')
const TransactionQuery = require('../dbs/transaction.mysql')
const ImageData = require("../dbs/image.mysql")
const {SaveListQuery, SavePostQuery} = require('../dbs/savePost.mysql')
const POST_BODY = {
    POST_TITLE: 'postTitle',
    POST_STATUS: 'postStatus',
    POST_PERMIT: 'postPermit',
    POST_CATEGORY: 'postCategory',
    POST_SUMMARIZE: 'postSummarize',
    POST_CONTENT: 'postContent',
}
function getFirst100Words(text) {
    // Split the text into an array of words
    const words = text.split(' ');
  
    // Get the first 100 words or the entire text if it has less than 100 words
    const first100Words = words.slice(0, 100).join(' ');
  
    return first100Words;
  }

class PostService
{
    static async updatePostStatus(newStatusEdit, postId)
    {
        if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postExist = await PostQuery.getPostByPostId(postId)
        if(postExist == null || postExist.statusEdit === newStatusEdit)
        {
            throw new BadRequestError("Post did not exist or has been matched status")
        }
        // update post-status
        try {
            await PostQuery.updatePostStatus(newStatusEdit,postId)
        } catch (error) {
            throw new BadRequestError(error)
        }
    }
    static publishPost = async (req) =>{
        const userId = req.cookies.userId;
        const postTitle = req.body[POST_BODY.POST_TITLE];
        const postStatus = req.body[POST_BODY.POST_STATUS];// should skip because when publish it always is publish
        const postPermit = req.body[POST_BODY.POST_PERMIT];
        const postSummarize = req.body[POST_BODY.POST_SUMMARIZE];
        const postContent = req.body[POST_BODY.POST_CONTENT];
        const postCategory = req.body[POST_BODY.POST_CATEGORY]
        if( !userId || 
            !postTitle ||
            !postStatus ||
            !postPermit ||
            !postContent ||
            !postSummarize ||
            !postCategory)
        {
            throw new BadRequestError("Not Enough Headers")
        }

        if( postStatus !== 'publish')
        {
            throw new BadRequestError("Post status should be Publish")
        }

        const categoryData = await PostQuery.getCategory(postCategory)
        if(categoryData == null)
        {
            throw new BadRequestError("Category name is invalid")
        }
        const postIdNew = await PostQuery.insertPostToDb(postTitle, postStatus, postPermit, postSummarize, postContent, userId, categoryData.categroryId)
        if(postIdNew == null)
        {
            throw new BadRequestError("Can Not Create New Post")
        }
        return {newPostId: postIdNew}
    }

    static getCategoryList = async (req) => {
        return await PostQuery.getCategoryList()
    }

    static publishPostWithThumbnail = async (req) =>{
        const userId = req.cookies.userId;
        const parsingPostData = JSON.parse(req.body.postData)
        const postTitle = parsingPostData[POST_BODY.POST_TITLE];
        const postStatus = parsingPostData[POST_BODY.POST_STATUS];// should skip because when publish it always is publish
        const postPermit = parsingPostData[POST_BODY.POST_PERMIT];
        const postSummarize = parsingPostData[POST_BODY.POST_SUMMARIZE];
        const postContent = parsingPostData[POST_BODY.POST_CONTENT];
        const postCategory = parsingPostData[POST_BODY.POST_CATEGORY]
        if( !userId || 
            !postTitle ||
            !postStatus ||
            !postPermit ||
            !postContent ||
            !postSummarize ||
            !postCategory)
        {
            throw new BadRequestError("Not Enough Headers")
        }
        const { filename } = req.file;
        if(!filename)
        {
            throw new BadRequestError("Please adding thumbnail for this post")
        }
        
        if( postStatus !== 'publish')
        {
            throw new BadRequestError("Post status should be Publish")
        }

        const categoryData = await PostQuery.getCategory(postCategory)
        if(categoryData == null)
        {
            throw new BadRequestError("Category name is invalid")
        }
        await TransactionQuery.startTransaction()
        try {
            const postIdNew = await PostQuery.insertPostToDb(postTitle, postStatus, postPermit, postSummarize, postContent, userId, categoryData.categroryId)
            if(!postIdNew)
            {
                throw new Error("PostId is null")
            }
            const blobLink = req.protocol + '://' + req.get('host') + '/images/' + filename;
            await ImageData.upSertImage(blobLink, 'thumnail', userId, postIdNew)
            await TransactionQuery.commitTransaction()
            return {newPostId: postIdNew,
                    thumbnail: blobLink}
        } catch (error) {
            await TransactionQuery.rollBackTransaction()
            console.log(error)
            throw new BadRequestError("Error: Issue when create new post with thumbnail") 
        }
    }

    static rePublishPost = async (req) => {
        const newStatusEdit = 'publish'
        const postId = req.params.postId
        await PostService.updatePostStatus(newStatusEdit, postId)
        return {metaData: `update post ${postId} to ${newStatusEdit} mode`}
    }
    
    static unpublishPost = async(req) => {
        const newStatusEdit = 'unpublish'
        const postId = req.params.postId
        await PostService.updatePostStatus(newStatusEdit, postId)
        return {metaData: `update post ${postId} to ${newStatusEdit} mode`}
    }

    static readSinglePost = async (req) =>{
       //1. check post existed in db or not
       //2. get post data
       //4. get author data
       //4. return author data + post data to client
       const postId = req.params.postId
       const userId = req.cookies.userId
       if(!postId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
       if(await PostQuery.isUserCanReadPost(userId, postId))
       {
           const postData = await PostQuery.getPostByPostId(postId)
           if(postData == null)
           {
               throw new BadRequestError("Your post request does not exist")
           }
           return {metaData: postData}
       }
       else
       {
            throw new BadRequestError("You do not permission to view this post")
       }
    }

    static editPost = async(req) => {
        const postId = req.params.postId
        if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        const {title, statusEdit, sharePermission, categroryName} = req.query
        const {postContent} = req.body
        var categroryId = null
        if(categroryName)
        {
            const existingCategory = await PostQuery.getCategory(categroryName)
            if(existingCategory == null)
            {
                throw new BadRequestError("The category does not exist")
            }
            else
            {
                categroryId = existingCategory.categroryId
            }
        }
        var summarize = null
        if(postContent)
        {
            summarize=getFirst100Words(postContent)
        }
        const queriesData = {
            title: title,
            statusEdit: statusEdit,
            sharePermission: sharePermission,
            summarize: summarize,
            content: postContent
        }
        try {
            await PostQuery.updatePost(queriesData, postId, categroryId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static deletePost = async (req) => {
        const postId = req.params.postId
        if(!postId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        try {
            await PostQuery.deletePost(postId)
        } catch (error) {
            throw new BadRequestError("Can not delete Post")
        }
        return {metaData: `Delete Post ${postId} Success`}
    }

    static deleteAllPost = async (req) => {
        const ans = req.query.ans
        if(!ans || ans != 'true')
        {
            throw new BadRequestError("All your posts did not remove")
        }
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError("Your are not have an authorization")
        }
        try {
            await PostQuery.deletePostByUser(userId)
        } catch (error) {
            throw new BadRequestError("Can not delete Post")
        }
        return {metaData: `Delete all for user ${userId} Success`}
    }

    static commentPost = async(req) => {
        const postId = req.params.postId;
        // commentId and parent comment Id might be null
        const commentId = req.body.commentId;
        const parentCommentId = req.body.parentCommentId;
        const comment = req.body.comment
        const userId = req.cookies.userId
        if(!postId || !comment || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }

        if(parentCommentId)
        {
            const parentData = await PostQuery.getCommentById(parentCommentId)
            if(parentData == null)
            {
                throw new BadRequestError(`parent comment with id ${parentCommentId} did not exist`)
            }
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        try {
            await PostQuery.upSertCommentForPost(comment, postId, userId, parentCommentId, commentId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static deleteComment = async(req) => {
        const commentId = req.params.commentId;
        const userId = req.cookies.userId;
        console.log(commentId)
        if(!commentId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const commentData = await PostQuery.getCommentById(commentId, userId)
        if(commentData == null)
        {
            throw new BadRequestError(`comment with id ${commentId} did not exist`)
        }
        try {
            const commentDeleted= await PostQuery.deleteComment(commentId, userId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static getComment = async (req) => {
        const postId = req.params.postId;
        const userId = req.cookies.userId;
        const parentCommentId = req.query.parentCommentId
        if(!postId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        if(parentCommentId)
        {
            return await PostQuery.getCommentByParentId(parentCommentId)
        }
        else
        {
            return await PostQuery.getCommentByPostId(postId)
        }
    }

    static getAllComment = async (req) => {
        const postId = req.params.postId;
        const userId = req.cookies.userId;
        if(!postId || !userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const listComment = await PostQuery.getCommentByPostId(postId, false)

    }

    static likePost = async(req) => {
        const postId = req.params.postId
        const userId = req.cookies.userId
        console.log(userId)
        if(!userId)
        {
            throw new BadRequestError("Please give more infor")
        }
        const postData = await PostQuery.getPostByPostId(postId)
        if(postData == null)
        {
            throw new BadRequestError(`post with id ${postId} did not exist`)
        }
        try {
            await PostQuery.upSertLikeForPost(postId, userId)
        } catch (error) {
            throw new BadRequestError(error)
        }
        return {metaData: {}}
    }

    static getMyPosts = async (req) =>{
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new AuthFailureError("Not Enough Info")
        }
        const numberPosts = await PostQuery.getNumberPostOfUser(userId)
        const listPost = await PostQuery.getPostByUserId(userId, numberPosts)
        return {
            numberPosts: numberPosts,
            listPost: listPost
        }
    }

    static getAllPost = async (req) => {
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new AuthFailureError("Not Enough Info")
        }
        const numberPosts = await PostQuery.getNumberPostFollowedByUser(userId)
        const listPost = await PostQuery.getPostByUserIdV2(userId, numberPosts)
        return {
            numberPosts: numberPosts,
            listPost: listPost
        }
    }

    static savePost = async (req) => {
        const {postId, nameList} = req.body
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError("Issue related to miss authentication info")
        }
        if(!postId || !nameList)
        {
            throw new BadRequestError("Please give postId nameList")
        }
        const savePostQuery = new SavePostQuery()
        return await savePostQuery.saveNewPost(userId, nameList, postId)
    }

    static unSavePost = async (req) => {
        const {postId, saveListId} = req.params
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError("Issue related to miss authentication info")
        }
        if(!postId)
        {
            throw new BadRequestError("Please give postId")
        }
        const savePostQuery = new SavePostQuery()
        return await savePostQuery.unsavePost(userId, saveListId, postId)
    }

    static getSavePosts = async (req) => {
        const saveListId= req.params.saveListId
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError("Issue related to miss authentication info")
        }
        if(!saveListId)
        {
            throw new BadRequestError("Please give more information")
        }
        const savePostQuery = new SavePostQuery()
        return await savePostQuery.getSavedPost(saveListId, userId)
    }

    static getSaveListName = async(req) => {
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError("Issue related to miss authentication info")
        }
        const savePostQuery = new SavePostQuery()
        return await savePostQuery.getSavedListByUserId(userId)
    }

    static deleteSaveList = async(req) => {
        const saveListId= req.params.saveListId
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError("Issue related to miss authentication info")
        }
        if(!saveListId)
        {
            throw new BadRequestError("Please give more information")
        }
        const savePostQuery = new SavePostQuery()
        return await savePostQuery.deleteSavePostById(saveListId, userId)
    }
    
}

module.exports = PostService