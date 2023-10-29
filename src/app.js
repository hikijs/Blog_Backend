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
const initializeWebServer = () =>
{
    console.time(">>> Start Application")
    return new Promise((resolve, reject) => {
        try {
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
                console.error("SERVER ERROR: Not Found Route")
                const error = new Error('Not Found')
                error.status = 404
                next(error)
            })
            
            app.use((error, req, res, next) => {
                console.error("SERVER ERROR: Error Happen")
                const statusCode = error.status || 500
                return res.status(statusCode).json({
                    status: 'error',
                    code: statusCode,
                    message: error.message || "internal server error"
                })
            })
            const PORT = process.env.PORT || 3000
            connection = app.listen(PORT, () => {
                console.log(`Application is listen on port ${PORT}`)
                console.timeEnd(">>>>> Start Application")
                resolve(connection.address());
    
            });
        } catch (error) {
            console.error(error)
            console.timeEnd(">>>>> Start Application")
            reject(null);
        }
    })
}

const stopWebServer = () => {
    return new Promise((resolve, reject) => {
      connection.close(() => {
        resolve();
      });
    });
};

module.exports = {
    initializeWebServer,
    stopWebServer,
};