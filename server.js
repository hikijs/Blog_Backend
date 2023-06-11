const app = require("./src/app")
require('dotenv').config()
PORT = process.env.PORT || 3055

const server = app.listen (PORT, () => {
    console.log(`Server Blog start with ${PORT}`)
})