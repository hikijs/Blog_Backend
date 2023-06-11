require('dotenv').config()
const axios = require('axios')

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET
const FACEBOOK_APP_AUTHORIZED_REDIRECT_URI = process.env.FACEBOOK_APP_AUTHORIZED_REDIRECT_URI
const getOauthFacebookDialog = () => {
  const rootUrl = 'https://www.facebook.com/v18.0/dialog/oauth'
  const options = {
    client_id: FACEBOOK_APP_ID,
    redirect_uri: FACEBOOK_APP_AUTHORIZED_REDIRECT_URI,
    scope: [
      'email',
      'public_profile'
    ].join(' '),
    auth_type: "reauthenticate",
    state: "{st=state123abc,ds=123456789}"
  }
  const qs = new URLSearchParams(options)
  const fbDialog = `${rootUrl}?${qs.toString()}`
  console.log(fbDialog)
  return fbDialog
}

const getFacebookAccessKey = async (code) => {
  const getAccessUrlRoot = 'https://graph.facebook.com/v18.0/oauth/access_token'
  const options = {
      code,
      client_id: FACEBOOK_APP_ID,
      client_secret: FACEBOOK_APP_SECRET,
      redirect_uri: FACEBOOK_APP_AUTHORIZED_REDIRECT_URI
  }
  const qs = new URLSearchParams(options)
  const getAccessKeyFbUrl = `${getAccessUrlRoot}?${qs.toString()}`
  console.log(getAccessKeyFbUrl)
  const { data } = await axios.get(getAccessKeyFbUrl)
  return data
}

const getFacebookUser = async (access_token) => {
  const userInfor = `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${access_token}`

  const {data} = await axios.get(userInfor)
  return data
}

const revokeAccessTokenFacebook = async(access_token) => {
  try {
    const revokeAccessTokenUrl = `https://graph.facebook.com/v18.0/me/permissions?access_token=${access_token}`
    const result = await axios.delete(revokeAccessTokenUrl)
    console.log("revoke facebook token success")
  } catch (error) {
    console.log("revoke facebook token failed")
  }
}
module.exports = {getOauthFacebookDialog, getFacebookAccessKey, getFacebookUser, revokeAccessTokenFacebook}