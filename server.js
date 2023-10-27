const RabbitMq = require("./src/messageQueue/setupRabbitMq")
require('dotenv').config()
PORT = process.env.PORT || 3055
const initializeDatabase = require('./src/dbs/setupDatabase')
const initializeRabbitMQ = require('./src/messageQueue/setupRabbitMq')
const initilizeApplication = require('./src/app')
// Using Dependence Injection For DB and Rabbit Mq for easily testing
initializeDatabase()

initializeRabbitMQ(RabbitMq)

const app = initilizeApplication()
app.listen (PORT, () => {
        console.log(`Server Blog is listening on PORT ${PORT}`)
})