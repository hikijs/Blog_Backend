require('dotenv').config()
const axios = require('axios')

const getOauthGoogleUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid'
    ].join(' ')
  }
  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}


const getOauthGooleToken = async (code) => {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    return data
}

const getGoogleUser = async ({ id_token, access_token }) => {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        params: {
          access_token,
          alt: 'json'
        },
        headers: {
          Authorization: `Bearer ${id_token}`
        }
      }
    )
    return data
  }

const revokeAccessTokenGoogle = async (accessToken) => {

  axios.post('https://oauth2.googleapis.com/revoke', null, {
    params: {
        token: accessToken,
    }
  }).then(response => {
    console.log("revoke google success")
  }).catch(error => {
    console.error(error)
    console.error("revoke google failure")
  });
}

module.exports = {getOauthGooleToken, getGoogleUser, revokeAccessTokenGoogle, getOauthGoogleUrl}