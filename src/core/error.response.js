'use strict'

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNAUTHORIZE: 400,
}

const reasonStatus = {
    FORBIDDEN: "Bad Request",
    CONFLICT: "Conflict Error",
    UNAUTHORIZE: "Unauthorize"
}

class ErrorResponse extends Error {
    constructor(message, status)
    {
        super(message)
        this.status = status
    }
}


class ConflictRequestError extends ErrorResponse {
    constructor(message = reasonStatus.CONFLICT,
               statusCode = StatusCode.CONFLICT)
    {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = reasonStatus.FORBIDDEN,
               statusCode = StatusCode.FORBIDDEN)
    {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = reasonStatus.UNAUTHORIZE,
        statusCode = StatusCode.UNAUTHORIZE)
    {
    super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError
}