const initializeDatabase = require('../../src/dbs/setupDatabase')
const initilizeApplication = require('../../src/app')

initializeDatabase()

const app = initilizeApplication()

module.exports = app
