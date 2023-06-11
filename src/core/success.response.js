'use strict'

const StatusCode = {
    OK: 200,
    CREATED: 201,
    REDIRECT: 302
}

const ReasonCode = {
    CREATED: "Created",
    OK: "Success",
    REDIRECT: "Redirect"
}

class SuccessResponse {
    constructor(
        {
            message,
            statusCode = StatusCode.OK, 
            reasonCode = ReasonCode.OK,
            metaData = {},
        }
    )
    {
        this.message = !message ? reasonCode : message
        this.status = statusCode
        this.metaData = metaData
    }

    send (res, headers = {})
    {
        return res.status(this.status).json(this)
    }

    redirectToOauthPage(res)
    {
        const {oauthUrl} = this.metaData
        res.redirect(this.status, oauthUrl)
    }

    redirectToFrontEnd(res)
    {
        const feUrl = "http://localhost:3001"
        res.redirect(this.status, feUrl)
    }

    sendFile (res, filename)
    {
        return res.sendFile(filename)
    }
}


class OK extends SuccessResponse{
    constructor({message, metaData})
    {
        super({message, metaData})
    }
}

class CREATED extends SuccessResponse{
    constructor({message, statusCode = StatusCode.CREATED, reasonCode = ReasonCode.CREATED, metaData})
    {
        super({message, statusCode, reasonCode, metaData})
    }
}
class REDIRECT extends SuccessResponse{
    constructor({message, statusCode = StatusCode.REDIRECT, reasonCode = ReasonCode.REDIRECT, metaData})
    {
        super({message, statusCode, reasonCode, metaData})
    }
}

module.exports = {
    OK, 
    CREATED,
    REDIRECT
}