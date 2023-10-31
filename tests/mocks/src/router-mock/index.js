// jest.mock('../../src/routers/index', () => {
// 	console.log('viethung')
// 	const express = require('express');
// 	const { asyncHanlder } = require('../../src/helpers/asyncHandler');
// 	const { BadRequestError } = require('../../src/core/error.response');
// 	const router = express.Router();
// 	router.use('/test', router.get('/badRequest', asyncHanlder(
// 		async (res, req, next) => {
// 			throw new BadRequestError();
// 		}
// 	)));
// 	return router;
// });

const express = require('express');
const router = express.Router();
router.use('/test', require('./mock-api/api'));
module.exports = router;
