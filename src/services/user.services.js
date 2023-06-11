const UserQuery  = require('../dbs/user.mysql')
const FriendQuery = require('../dbs/friends.mysql')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const VerifyCodeQuery = require("../dbs/verifyCode.mysql")
const {generateVerificationCode} = require('../helpers/randomCode')
const mailTransport = require('../helpers/mailHelper')
const {TIMEOUT, VERIFYCODE_TYPE, NOTIFICATION_CONFIG} = require('../configs/configurations')
const TransactionQuery = require('../dbs/transaction.mysql')
const {NotifyManager} = require("./notification.services")
const { getApi, putApi } = require('../helpers/callApi')
const { createCookiesLogout } = require('../cookies/createCookies')
class UserService
{
    static getMyProfile = async (req) =>
    {
        const userId = req.cookies.userId
        try {
            const userData = await UserQuery.getUserById(userId)
            return userData
        } catch (error) {
            throw new Error(`Get Profile failed with reason ${error}`)
        }
    }

    static getUserInfo = async (req) =>
    {
        const currentUserId = req.cookies.userId
        const userId = req.params.userId
        if(!userId || !currentUserId)
        {
            throw new BadRequestError("Please give more infor")
        }
        try {
            const userExists = await UserQuery.checkUserExistById(userId)
            if(userExists)
            {
                const userData = await UserQuery.getUserById(userId, currentUserId == userId)
                return userData
            }
            else
            {
                throw new BadRequestError("User does not exist")
            }
        } catch (error) {
            throw new Error(`Get Profile failed with reason ${error}`)
        }
    }

    static updateProfile = async (req) =>
    {
        const userId = req.cookies.userId
        const {userName, email, bio, birthDay} = req.body
        const queries = {
            userName: userName,
            email: email,
            bio: bio,
            birthDay: birthDay
        }
        try {
            const newUserData = await UserQuery.updateUserProfile(queries, userId)
            return newUserData
        } catch (error) {
            throw new Error(`Get Profile failed with reason ${error}`)
        }
    }

    static deleteProfile = async (req, res) => 
    {
        const userId = req.cookies.userId
        try {
            const deteteResult = await UserQuery.deleteUser(userId)
            createCookiesLogout(res)
            return deteteResult
        } catch (error) {
            throw new Error(`Delete Profile failed with reason ${error}`)
        }
    }

    static verifyEmailForUser = async (req) => 
    {
        const userId = req.cookies.userId
        const userData = await UserQuery.getUserById(userId)
        if(!userData)
        {
            throw new BadRequestError("The user does not exist")
        }
        if(userData.verified)
        {
            throw new BadRequestError("The user has been verified")
        }
        try{
            const code = generateVerificationCode()
            const codeExpiry = Date.now() +  TIMEOUT.verifyCode; // Token expires in 1 hour
            await VerifyCodeQuery.createNewVerifyCode(code, codeExpiry, VERIFYCODE_TYPE.VERIFY_EMAIL, userData.userId)
            mailTransport.send(userData.email,'reset code', code)
            const metaData = {
                link:`http://localhost:3000/v1/api/user/auth/verify/${code}`
            }
            return metaData
        } catch (error) {
            throw new Error(`verify email for user failed with reason ${error}`)
        }
    }

    static updateStatusVerifyForUser = async (req) => {
        const userId = req.cookies.userId
        const verifyCode = req.params.verifyCode
        if(!verifyCode || !userId)
        {
            throw new BadRequestError('Please give more information')
        }
        const existingCode = await VerifyCodeQuery.checkCodeExistOrNot(verifyCode, userId, VERIFYCODE_TYPE.VERIFY_EMAIL)
        if(existingCode == null)
        {
            throw new BadRequestError("Incorrect Code Please Fill Again")
        }
        try {
            await UserQuery.updateVerifiedStatus(true, userId)
            await VerifyCodeQuery.deleteVerifyCode(verifyCode, userId, VERIFYCODE_TYPE.VERIFY_EMAIL)
        } catch (error) {
            throw new BadRequestError(`Update status verified of user is not successful with reason ${error}`)
        }
        
        return {}
    }

    static getFriendRequest = async(req) => {
        const recipientId = req.cookies.userId
        const status = req.query.status
        if(!recipientId)
        {
            throw new BadRequestError('Please give more information')
        }
        if(status && status != 'Accepted' && status != 'Rejected' && status != 'Pending')
        {
            throw new BadRequestError("The status does not expectation, should be (Accepted ,Rejected or Pending)")
        }

        try
        {
            const listRequests = await FriendQuery.getAllFriendRequestsByStatus(recipientId, status)
            return {listRequests: listRequests}
        }
        catch (error) {
            throw new BadRequestError("Something went wrong when getting data")
        }
    }

    static friendRequest = async (req) => {
        const requesterId = req.cookies.userId
        const recipientId = req.params.friendId
        
        if(!requesterId || !recipientId)
        {
            throw new BadRequestError('Please give more information')
        }
        if(requesterId === recipientId)
        {
            throw new BadRequestError('Please double check your input')
        }
        await TransactionQuery.startTransaction()
        try {
            // because this is the request friend so that status is Pending
            const status = "Pending"
            await FriendQuery.upsertNewFriendRequest(requesterId, recipientId, status)
            // trigger sending notify for friend request event
            NotifyManager.triggerNotify(NOTIFICATION_CONFIG?.TYPES?.friendRequest, requesterId, recipientId)
            await TransactionQuery.commitTransaction()
        } catch (error) {
            await TransactionQuery.rollBackTransaction()
            throw new BadRequestError(error)
        }
        return {}
    }

    static unfriend = async (req) => {
        const requesterId = req.cookies.userId
        const recipientId = req.params.friendId
        if(requesterId === recipientId)
        {
            throw new BadRequestError('Please double check your input')
        }
        if(!requesterId || !recipientId)
        {
            throw new BadRequestError('Please give more information')
        }
        await TransactionQuery.startTransaction()
        try {
            await FriendQuery.deleteFriendShip(requesterId, recipientId)
            await TransactionQuery.commitTransaction()
        } catch (error) {
            await TransactionQuery.rollBackTransaction()
            throw new BadRequestError(error)
        }
        return {}
    }

    static answereRequest = async (req) => {
        const recipientId = req.cookies.userId
        const requesterId = req.params.requesterId
        const status = req.query.ans
        if(requesterId === recipientId)
        {
            throw new BadRequestError('Please double check your input')
        }
        const friendlyExistence = await FriendQuery.checkIfTheyAreFriend(requesterId, recipientId)
        if(friendlyExistence)
        {
            throw new BadRequestError('You and this user is the friend right now')
        }
        if(!requesterId || !recipientId || !status)
        {
            throw new BadRequestError('Please give more information')
        }
        // should be answered for pending request, that mean each request only was answered one time
        const friendRequestExist = await FriendQuery.isFriendRequestExist(requesterId, recipientId, "Pending")
        if(!friendRequestExist)
        {
            throw new BadRequestError("No friend request with status is pending exist, maybe you have answered before")
        }
        // update friend request and frienship
        await TransactionQuery.startTransaction()
        try {
            await FriendQuery.updateFriendRequest(requesterId, recipientId, status)
            const currentStatus = await FriendQuery.getStatusOfFriendRequest(requesterId, recipientId)
            if(currentStatus == "Accepted")
            {
                await FriendQuery.addNewFriendShip(recipientId, requesterId)
                // trigger sending notify for answere request event
                // this change the position of recipient and requester for mapping the notify
                NotifyManager.triggerNotify(NOTIFICATION_CONFIG?.TYPES?.acceptedRequest, recipientId, requesterId)
            }
            await TransactionQuery.commitTransaction()
        }
        catch (error) {
            await TransactionQuery.rollBackTransaction()
            throw new BadRequestError(error)
        }
        return {}
    }

    static getMyFriends = async (req) => {
        const userId = req.cookies.userId
        if(!userId)
        {
            throw new BadRequestError('Please give more information')
        }
        try {
            const listFriends = await FriendQuery.getFriendOfUser(userId)
            return {listFriends: listFriends}
        } catch (error) {
            throw new BadRequestError(error)
        }
    }

    static getRecommendFollowings = async (req) => {
        const userId = req.cookies.userId
        const limit = req.query.limit || 3
        let page = Number(req.query.page) || 1
        if(!userId)
        {
            throw new BadRequestError('Please give more information')
        }
        try {
            const totalRecommend = await FriendQuery.getTotalNotFriend(userId)
            const maxPage = Math.ceil(totalRecommend/limit)
            console.log(maxPage)
            let nextPage = 0
            if(page > maxPage || maxPage == 0)
            {
                page = 1
                nextPage = maxPage == 0? 1: page + 1;
            }
            else
            {
                nextPage = page + 1
            }
            const offset = (page  - 1) * limit;
            const listNotFriendWithUser = await FriendQuery.getListNotFriendWithUser(userId, limit, offset)
            // if go to next page, the next page is 1, looping
            const linkNextPage = `http://${req.host}:3000/v1/api/user/recommendFollowing?limit=${limit}&page=${nextPage}`
            // FIXME the prev link does not used now, so maybe some issue there
            const linkPreviousPage = `http://${req.host}:3000/v1/api/user/recommendFollowing?limit=${limit}&page=${page-1}`
            return {
                        totalPage: maxPage,
                        nextPage: linkNextPage,
                        prevPage: linkPreviousPage,
                        totalRecommend,
                        RecommendFollowList: listNotFriendWithUser
                    }
        } catch (error) {
            throw new BadRequestError(error)
        }
    }

    static getAllNotify = async (req) => {
        const userId = req.cookies.userId
        // FIXME HARD CODE LINK
        const url = "http://notification_backend:3002/notifies/"+userId
        console.log(url)
        const data = await getApi(url)
        return data.data // FIXME the data was return from notify service is data. data this is not god
    }

    static setReceivedNotifies = async (req) => {
        const userId = req.cookies.userId
        // FIXME HARD CODE LINK
        const url = "http://notification_backend:3002/receivedApi/"+userId
        console.log(url)
        try {
            const data = await putApi(url)
            return {data}
        } catch (error) {
            throw new BadRequestError("Issue in notify service")
        }
    }

    static readNotify = async (req) => {
        const notifyId = req.params.notifyId
        // FIXME HARD CODE LINK
        const url = "http://notification_backend:3002/readNotify/"+notifyId
        console.log(url)
        try {
            const data = await putApi(url)
            return {data}
        } catch (error) {
            throw new BadRequestError("Issue in notify service")
        }
    }
}


module.exports = UserService