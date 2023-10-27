const express = require ('express')
const cors = require('cors');
const morgan = require ('morgan')
const helmet = require ('helmet')
const compress = require ('compression')
const app = express()
const cookieParser = require('cookie-parser')
const path = require('path');
require('dotenv').config()
console.log(`===== The currently Enviroment of Node is ${process.env.NODE_ENV} =====`)
//A. init middeware
// allow all site can access the API
const initilizeApplication = (z) =>
{
    app.use(cors({
        origin: ['https://blog.hunghoang.online',
                 'http://localhost:3000',
                 'http://localhost:3001'],
        credentials: true
    }));
    // parse cookie
    app.use(cookieParser());
    // logging for server using morgan has 5 types (dev, combined, common, short, tiny)
    app.use(morgan("common"))
    // helmet for protect info package http
    // that helping CROS attack, so if test in local please comment it
    // app.use(helmet())
    // compression reduce the size of package
    app.use(compress())
    
    app.use(express.json())
    app.use(express.urlencoded({extends: true}))
    
    //C. init handle error
    app.use(express.static(path.join(__dirname, '..', 'uploads')))
    //init routes
    app.use(require("./routers"))
    
    // handling error
    app.use((req, res, next) => {
        console.log("centralize error")
        const error = new Error('Not Found')
        error.status = 404
        next(error)
    })
    
    app.use((error, req, res, next) => {
        console.log("handing error")
        const statusCode = error.status || 500
        return res.status(statusCode).json({
            status: 'error',
            code: statusCode,
            message: error.message || "internal server error"
        })
    })

    return app
}

module.exports = initilizeApplication