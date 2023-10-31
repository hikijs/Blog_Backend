const express = require('express');
const router = express.Router();
router.use('/test', require('./mock-api/api'));
module.exports = router;
