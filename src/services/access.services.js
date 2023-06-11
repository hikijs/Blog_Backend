const instanceMySqlDB = require('../dbs/init.mysql')
const UserQuery  = require('../dbs/user.mysql')
const {oauthProviderQuery, oauthProviderName} = require('../dbs/oauthProvider.mysql')
const KeyStoreQuery = require('../dbs/keystore.mysql')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const {createTokenPair} = require("../auth/authUtils")
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const VerifyCodeQuery = require("../dbs/verifyCode.mysql")
const {generateVerificationCode} = require('../helpers/randomCode')
const mailTransport = require('../helpers/mailHelper')
const {TIMEOUT, VERIFYCODE_TYPE} = require('../configs/configurations')
const TransactionQuery = require('../dbs/transaction.mysql')
const {getOauthGooleToken, getGoogleUser, revokeAccessTokenGoogle,getOauthGoogleUrl} = require('../helpers/OauthGoogle')
const {getOauthFacebookDialog, getFacebookAccessKey, getFacebookUser, revokeAccessTokenFacebook} = require('../helpers/OauthFacebook')
const {getOauthGithubDialog, getGithubAccessKey, getGithubUserData, revokeAccessTokenGithub, getGithubUserEmail} = require('../helpers/OauthGithub')
const ImageData = require("../dbs/image.mysql")
const {createCookiesAuthen, createCookiesLogout,
       createCookiesForgotPassword,
       createCookiesVerifyCode, createCookiesResetPasswordSuccess,
       } = require("../cookies/createCookies")
class AccessService
{
    //1. Check username and email does not exist in the database
    //2. Hashing password
    //3. Insert new User to DB
    //4. Create token pairs by publickey and privatekey
    //5. Store the pub, pri, accesstoken, refreshtoken 
    static signUp = async ({username, email, password, birth}) => {
        const exist = await UserQuery.checkUserExist(username,email)
        // for case db has problem
        if(exist == null)
        {
            throw new BadRequestError("Error: Issue in DB when register")
        }
        // check existing
        if (exist == true)
        {
            throw new BadRequestError("Error: username or email exist")
        }
        
        const passwordHashed = await bcrypt.hash(password, 10)

        await TransactionQuery.startTransaction()
        try {
            const newUser = await UserQuery.addUser(username, email, passwordHashed, birth)
            const publicKey = crypto.randomBytes(64).toString('hex')
            const privateKey = crypto.randomBytes(64).toString('hex')
            const tokens = await createTokenPair({userId: newUser, email: email},
                                                 publicKey,
                                                 privateKey)
            const newKey = await KeyStoreQuery.addKeyStore(publicKey,
                                                            privateKey,
                                                            tokens.accessToken,
                                                            tokens.refreshToken,
                                                            "{}",
                                                            newUser)
            await TransactionQuery.commitTransaction()
            return {newUserId: newUser,
                    newTokens: {
                        publicKey: publicKey,
                        accessKey: tokens.accessToken,
                        refreshKey: tokens.refreshToken
                    }}  
        } catch (error) {
            await TransactionQuery.rollBackTransaction()
            throw new BadRequestError("Error: Issue when create new user and keystore")       
        }           
    }

    /*
        1 - check username in dbs
        2 - check matching password
        3 - create accesstonken and refreshtoken
        4 - generate token
        5 - get data return login
    */ 
    static login = async (req, res) => {
        const {username, email, password} = req.body
        const userInstance =  await UserQuery.getUserName(username)
        // for case db has problem
        if(userInstance == null)
        {
            throw new BadRequestError("Fobbiden: Issue in DB when register") //403
        }
        if(password == undefined)
        {
            throw new BadRequestError("Fobbiden: Please provide more information ") //403
        }
        const match = await bcrypt.compare(password, userInstance.password)
        if(!match)
        {
            throw new AuthFailureError("Authentication Failed") // 400
        }

        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')
        const instanceId = userInstance.userId
        console.log(`update date key store for user ${instanceId}`)
        const tokens = await createTokenPair({userId: instanceId, email: email},
                                                 publicKey,
                                                 privateKey)
        const newKey = await KeyStoreQuery.addKeyStore(publicKey,
                                                         privateKey,
                                                         tokens.accessToken,
                                                         tokens.refreshToken,
                                                         "{}",
                                                         instanceId)
        console.log(`The new key has been added ${newKey}`)
        const metaData = {userId: instanceId,
                          newTokens: {accessKey: tokens.accessToken,
                                      refreshKey: tokens.refreshToken}
                         }
        createCookiesAuthen(res, tokens.accessToken, tokens.accessToken, instanceId)
        return {metaData}
    }
    
    static googleLogin = async(req, res) => 
    {
        const googleConsentUrl = getOauthGoogleUrl();
        return {metaData: {
            oauthUrl: googleConsentUrl
        }}
    }

    static callbackGoogleLogin = async (req, res) =>
    {
        const {code} = req.query
        try {
            const oauthProvider = oauthProviderName.GOOGLE
            const data = await getOauthGooleToken(code)
            console.log('===== GOOGLE ACCESS KEY INFOR========')
            console.log(data)
            const { id_token, access_token } = data 
            const googleUser = await getGoogleUser({ id_token, access_token }) 
            console.log('===== GOOGLE USER INFOR========')
            console.log(googleUser)
            const {email, name, picture, verified_email} = googleUser
            await TransactionQuery.startTransaction()
            try {
                let exist = await UserQuery.getOauthUserByEmail(email, oauthProvider)
                let maxWhileTimes = 3
                while(!exist && maxWhileTimes)
                {
                    console.warn(`time ${3-maxWhileTimes} create new user if not exist`)
                    maxWhileTimes--; // ensure the while loop can end
                    // if the user does not existing in db create new
                    const userId = await UserQuery.addUser(name, email, null, null, verified_email, true)
                    // create a oauth record
                    await oauthProviderQuery.addNewOauthProvider(userId, oauthProvider, id_token, access_token)
                    exist = await UserQuery.getOauthUserByEmail(email, oauthProvider)
                }
                
                const {userId} = exist
                await UserQuery.updateVerifiedStatus(verified_email,userId)
                // update avatar for user
                await ImageData.insertImageToDb(picture,'avatar',userId)
                const publicKey = crypto.randomBytes(64).toString('hex')
                const privateKey = crypto.randomBytes(64).toString('hex')
                const tokens = await createTokenPair({userId: userId, email: email},
                                                    publicKey,
                                                    privateKey)
                await KeyStoreQuery.addKeyStore(publicKey,
                                                privateKey,
                                                tokens.accessToken,
                                                tokens.refreshToken,
                                                "{}",
                                                userId)
                const metaData = {userId: userId,
                                  newTokens: 
                                    {
                                        accessKey: tokens.accessToken,
                                        refreshKey: tokens.refreshToken
                                    }
                                 }
                createCookiesAuthen(res, tokens.accessToken, tokens.accessToken, userId)
                await TransactionQuery.commitTransaction()
                return {metaData}
            } catch (error) {
                console.log(error)
                await TransactionQuery.rollBackTransaction()
                throw new BadRequestError("Error: Issue when create new user and keystore")       
            }
        } catch (error) {
            console.log(error)
            throw new Error("Issue happen when login by google")
        }
    }

    static logout = async (req, res) =>{
        //FIX ME USER ID need take from the access token rather than the request body
        const {keyStore} = req
        const {userId} = keyStore
        const delKey = await KeyStoreQuery.deleteKeyStore(userId)
        // check if the user authentication is oauth shoud revoke
        try {
            const existingOauthUsr = await oauthProviderQuery.getOauthProvider(userId)
            console.log(existingOauthUsr)
            if(existingOauthUsr && existingOauthUsr.providerName == oauthProviderName.GOOGLE)
            {
                console.log("clean google oauth provider infor")
                await revokeAccessTokenGoogle(existingOauthUsr.accessToken)
                await oauthProviderQuery.deleteOauthProvider(userId)
            }
            else if(existingOauthUsr && existingOauthUsr.providerName == oauthProviderName.FACEBOOK)
            {
                console.log("clean facebook oauth provider infor")
                await revokeAccessTokenFacebook(existingOauthUsr.accessToken)
                await oauthProviderQuery.deleteOauthProvider(userId)
            }
            else if(existingOauthUsr && existingOauthUsr.providerName == oauthProviderName.GITHUB)
            {
                console.log("clean github oauth provider infor")
                await revokeAccessTokenGithub(existingOauthUsr.accessToken)
                await oauthProviderQuery.deleteOauthProvider(userId)
            }
        } catch (error) {
            console.error(`Error when checking the oauthprovider for user ${userId}`)
        }
       
        createCookiesLogout(res)
        return delKey
    }

    static facebookLogin = async(req, res) => 
    {
        const facebookUrl = getOauthFacebookDialog();
        return {metaData: {
                oauthUrl: facebookUrl
        }}
    }

    static callbackFacebookLogin = async (req, res) =>
    {
        const {code} = req.query
        console.log(code)
        try {
            const oauthProvider = oauthProviderName.FACEBOOK
            const data = await getFacebookAccessKey(code)
            console.log('===== FACEBOOK ACCESS KEY INFOR========')
            console.log(data)
            const { access_token } = data 
            const facebookUser = await getFacebookUser(access_token)
            console.log('===== FACEBOOK USER INFOR========')
            console.log(facebookUser)
            const {email, name} = facebookUser
            await TransactionQuery.startTransaction()
            try {
                let exist = await UserQuery.getOauthUserByEmail(email, oauthProvider)
                let maxWhileTimes = 3
                while(!exist && maxWhileTimes)
                {
                    console.warn(`time ${3-maxWhileTimes} create new user if not exist`)
                    maxWhileTimes--; // ensure the while loop can end
                    // if the user does not existing in db create new
                    const userId = await UserQuery.addUser(name, email, null, null, false, true)
                    // create a oauth record
                    await oauthProviderQuery.addNewOauthProvider(userId, oauthProvider, null, access_token)
                    exist = await UserQuery.getOauthUserByEmail(email, oauthProvider)
                }
                
                const {userId} = exist
                await oauthProviderQuery.addNewOauthProvider(userId, oauthProvider, null, access_token)
                const publicKey = crypto.randomBytes(64).toString('hex')
                const privateKey = crypto.randomBytes(64).toString('hex')
                const tokens = await createTokenPair({userId: userId, email: email},
                                                    publicKey,
                                                    privateKey)
                await KeyStoreQuery.addKeyStore(publicKey,
                                                privateKey,
                                                tokens.accessToken,
                                                tokens.refreshToken,
                                                "{}",
                                                userId)
                const metaData = {userId: userId,
                                  newTokens: 
                                    {
                                        accessKey: tokens.accessToken,
                                        refreshKey: tokens.refreshToken
                                    }
                                 }
                createCookiesAuthen(res, tokens.accessToken, tokens.accessToken, userId)
                await TransactionQuery.commitTransaction()
                return {metaData}
            } catch (error) {
                console.log(error)
                await TransactionQuery.rollBackTransaction()
                throw new BadRequestError("Error: Issue when create new user and keystore")       
            }
        } catch (error) {
            console.log(error)
            throw new Error("Issue happen when login by facebook")
        }
    }

    static githubLogin = async(req, res) => 
    {
        const githubAurthorUrl = getOauthGithubDialog();
        return {metaData: {
                oauthUrl: githubAurthorUrl
        }}
    }

    static callbackGithubLogin = async(req, res) => {
        const {code} = req.query
        console.log(code)
        try {
            const oauthProvider = oauthProviderName.GITHUB
            const data = await getGithubAccessKey(code)
            console.log('===== GITHUB ACCESS KEY INFOR========')
            console.log(data)
            const { access_token } = data 
            const githubUser = await getGithubUserData(access_token)
            const githubEmails = await getGithubUserEmail(access_token)
            console.log('===== GITHUB USER INFOR========')
            console.log(githubUser)
            console.log(githubEmails)
            const {login, avatar_url} = githubUser
            const name = login
            let email = ''
            let verified = false
            for(let i = 0; i < githubEmails.length ; i++)
            {
                const {primary} = githubEmails[i]
                if(primary == true)
                {
                    email = githubEmails[i].email
                    verified = githubEmails[i].verified
                }
            }
            await TransactionQuery.startTransaction()
            try {
                let exist = await UserQuery.getOauthUserByEmail(email, oauthProvider)
                let maxWhileTimes = 3
                while(!exist && maxWhileTimes)
                {
                    console.warn(`time ${3-maxWhileTimes} create new user if not exist`)
                    maxWhileTimes--; // ensure the while loop can end
                    // if the user does not existing in db create new
                    const userId = await UserQuery.addUser(name, email, null, null, false, true)
                    // create a oauth record
                    await oauthProviderQuery.addNewOauthProvider(userId, oauthProvider, verified, access_token)
                    exist = await UserQuery.getOauthUserByEmail(email, oauthProvider)
                }
                
                const {userId} = exist
                await oauthProviderQuery.addNewOauthProvider(userId, oauthProvider, null, access_token)
                // update avatar for user
                await ImageData.insertImageToDb(avatar_url,'avatar',userId)
                await UserQuery.updateVerifiedStatus(verified,userId)

                const publicKey = crypto.randomBytes(64).toString('hex')
                const privateKey = crypto.randomBytes(64).toString('hex')
                const tokens = await createTokenPair({userId: userId, email: email},
                                                    publicKey,
                                                    privateKey)
                await KeyStoreQuery.addKeyStore(publicKey,
                                                privateKey,
                                                tokens.accessToken,
                                                tokens.refreshToken,
                                                "{}",
                                                userId)
                const metaData = {userId: userId,
                                  newTokens: 
                                    {
                                        accessKey: tokens.accessToken,
                                        refreshKey: tokens.refreshToken
                                    }
                                 }
                createCookiesAuthen(res, tokens.accessToken, tokens.accessToken, userId)
                await TransactionQuery.commitTransaction()
                return {metaData}
            } catch (error) {
                console.log(error)
                await TransactionQuery.rollBackTransaction()
                throw new BadRequestError("Error: Issue when create new user and keystore")       
            }
        } catch (error) {
            console.log(error)
            throw new Error("Issue happen when login by github")
        }
    }

    static forgotPassword = async (req, res) => {
        //1. check mail exist or not in body
        const email = req.body.email
        if(!email)
        {
            throw new BadRequestError("Please Fill Email") //403
        }
        //2. check mail exist or not in the db
        const userExist = await UserQuery.getNonOauthUserByMail(email)
        if(!userExist)
        {
            throw new BadRequestError("The email does not register yet") //403
        }
        //3. create new token
        // Generate a unique token
        const code = generateVerificationCode()
        const codeExpiry = Date.now() +  TIMEOUT.verifyCode; // Token expires in 1 hour
        console.log(`code is ${code}`)
        await VerifyCodeQuery.createNewVerifyCode(code, codeExpiry, VERIFYCODE_TYPE.FORGOT_PASSWORD, userExist.userId)
        mailTransport.send(email,'reset code', code)
        const metaData = {
            msg: "Please check your email"
        }
        createCookiesForgotPassword(res, userExist.userId)
       return {metaData}
    }

    static forgotPasswordVerify = async (req, res) => {
        // FIXME because useId is depend on the cookies that lead to can not reset on another device
        const code = req.params.verifyCode
        const userId = req.cookies.userId
        const metaData = {}
        const existingCode = await VerifyCodeQuery.checkCodeExistOrNot(code, userId, VERIFYCODE_TYPE.FORGOT_PASSWORD)
        if(existingCode != null)
        {
            createCookiesVerifyCode(res, code)
        }
        else
        {
            throw new BadRequestError("Incorrect Code Please Fill Again")
        }
        
        return {metaData}
    }

    static resetPassword = async (req,res) => {
        // check password new and confirm exist
        const userId = req.cookies.userId
        const verifyCode = req.cookies.verifyCode
        const {newPassword, confirmPassword} = req.body
        if(!newPassword || !confirmPassword)
        {
            throw new BadRequestError('Not enough information request')
        }
        // check password new and confirm matched
        if(newPassword !== confirmPassword)
        {
            throw new BadRequestError('Both Password does not match together')
        }

        const passwordHashed = await bcrypt.hash(newPassword, 10)
        try {
            await UserQuery.updatePassword(passwordHashed, userId)
            await VerifyCodeQuery.deleteVerifyCode(verifyCode, userId, VERIFYCODE_TYPE.FORGOT_PASSWORD)
        } catch (error) {
            throw new BadRequestError('Update password is not successful')
        }
        createCookiesResetPasswordSuccess(res)
        return "Update Password Success"
    }
}

module.exports = AccessService