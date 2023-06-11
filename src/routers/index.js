'use strict'

const express = require('express')
// const { apiKey, permission } = require('../auth/checkAuth')
const router = express.Router()
// Checking apikey + permisstion before allowing to accessing resource
// 1. check api key 
// router.use(apiKey)
// 2. check permission
// router.use(permission('0000'))
router.use('/v1/api/auth', require("./access"))
router.use('/v1/api/oauth', require("./accessOauth"))
router.use('/v1/api/upload', require("./upload"))
router.use('/v1/api/post',require("./post"))
router.use('/v1/api/user',require("./user"))

module.exports = router