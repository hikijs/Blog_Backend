require('dotenv').config()
const axios = require('axios')

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_GITHUB_CLIENT_ID_SECRET = process.env.GITHUB_GITHUB_CLIENT_ID_SECRET
const GITHUB_AUTHORIZED_REDIRECT_URI = process.env.GITHUB_AUTHORIZED_REDIRECT_URI

const getOauthGithubDialog = () => {
  const rootUrl = 'https://github.com/login/oauth/authorize'
  const options = {
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_AUTHORIZED_REDIRECT_URI,
    scope: 'user',
    allow_signup: 'true'
  }
  const qs = new URLSearchParams(options)
  const githubDialog = `${rootUrl}?${qs.toString()}`
  console.log(githubDialog)
  return githubDialog
}

const getGithubAccessKey = async (code) => {
  const getAccessUrlRoot = 'https://github.com/login/oauth/access_token'
  const options = {
      code,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_GITHUB_CLIENT_ID_SECRET,
      redirect_uri: GITHUB_AUTHORIZED_REDIRECT_URI
  }
  const qs = new URLSearchParams(options)
  const getAccessKeyGithubUrl = `${getAccessUrlRoot}?${qs.toString()}`
  console.log(getAccessKeyGithubUrl)
  const { data } = await axios.post(getAccessKeyGithubUrl,
    {},
    {
      headers: {
        accept: 'application/json'
      }
  })
  return data
}

const getGithubUserData = async (access_token) => {
  const userInfor = "https://api.github.com/user"

  const {data} = await axios.get(
    userInfor,
    {
      headers: {
      'Authorization': `Bearer ${access_token}`
      }
    })
  return data
}

const getGithubUserEmail = async (access_token) => {
  const userInfor = "https://api.github.com/user/emails"

  const {data} = await axios.get(
    userInfor,
    {
      headers: {
      'Authorization': `Bearer ${access_token}`
      }
    })
  return data
}
const revokeAccessTokenGithub = async(access_token) => {
  // github does not provide any revoke api yet
}
module.exports = {getOauthGithubDialog, getGithubAccessKey, getGithubUserData, revokeAccessTokenGithub, getGithubUserEmail}