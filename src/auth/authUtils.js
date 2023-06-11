const JWT = require('jsonwebtoken')
const instanceMySqlDB = require('../dbs/init.mysql')
const {asyncHanlder} = require('../helpers/asyncHandler')
const {BadRequestError, AuthFailureError} = require("../core/error.response")
const VerifyCodeQuery = require("../dbs/verifyCode.mysql")
const { VERIFYCODE_TYPE } = require('../configs/configurations')
const KeyStoreQuery = require("../dbs/keystore.mysql")
// FIX me because currently in the source code, the keys are not key pair
// so that we only use private key
const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        // create access token by private key
        const accessToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        })
        // refresh access token by private key
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, privateKey, (err, decode) => {
            if(err){
                console.error(`error verify: `, err)
            }
            else{
                console.log(`decode verify: `, decode)
            }
        })
        return {accessToken, refreshToken}
    } catch (error) {
        console.log(error)
    }
}


const authentication = asyncHanlder(async (req, res, next) => {
    /*
        1. check userId misisng or not 
        2. get accesstonken
        3. verify token
        4. check user in dbs
        5. check keyStore with user
        6. oke all => return next()
    */

   const {accessToken, userId} = req.cookies
   //1
   if(!userId)
   {
       throw new AuthFailureError('Invalid request')
   }
   //2
   const keyStore = await KeyStoreQuery.getKeyStore(userId)
//    console.log(`Key store maybe is ${keyStore}`)
   if(keyStore == null)
   {
       throw new BadRequestError('Not Found User Id')
   }
   //3
   if(!accessToken)
   {
       throw new AuthFailureError("Invalid authorization")
   }

   try {
    //    console.log(`public key ${keyStore.publicKey} and private key ${keyStore.privateKey}`)
       const decodeUser = JWT.verify(accessToken, keyStore.privateKey)
       if(userId !== decodeUser.userId)
       {
            throw new AuthFailureError("Can not verify key")
       }
       req.keyStore = keyStore
    //    console.log(keyStore)
       next()

   } catch (error) {
        throw new AuthFailureError("Is there something wrong when verify key")
   }

})

// verify code and userId before reset password
const verifyResetPassword = asyncHanlder(async (req, res, next) => {
    const {userId, verifyCode} = req.cookies
    if(!userId || !verifyCode) 
    {
       throw new BadRequestError('Please provide more input data')
    }
    // verify code should be exist in db
    const codeExisting = await VerifyCodeQuery.checkCodeExistOrNot(verifyCode, userId, VERIFYCODE_TYPE.FORGOT_PASSWORD)
   
    if(codeExisting == null)
    {
        throw new AuthFailureError("Not correct Code or userID")
    }
    if(codeExisting.expireTime < Date.now())
    {
        throw new BadRequestError(`The verify code timeout ${codeExisting.expireTime} < ${new Date(Date.now())}`)
    }
    
    next()
})

module.exports = {createTokenPair, authentication, verifyResetPassword}