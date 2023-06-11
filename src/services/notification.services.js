const { BadRequestError } = require("../core/error.response");
const UserQuery = require("../dbs/user.mysql")
const {NOTIFICATION_CONFIG} = require("../configs/configurations");
const RabbitMq = require("../messageQueue/init.rabbitmq");

// Abstract Notify class
class NotifyAbstract {
    constructor(typeNotify, senderId, receiverId, postHint = undefined, commentHint = undefined)
    {
        console.log(senderId, receiverId)
        this.typeNotify = typeNotify
        this.senderId = senderId
        this.receiverId = receiverId
        if (postHint !== undefined) {
            this.postHint = postHint;
        }
        if (commentHint !== undefined) {
            this.commentHint = commentHint;
        }
    }

    async updateDeliveryData()
    {
        if(!this.senderId || !this.receiverId)
        {
            throw BadRequestError("No delivery information")
        }

        const senderData = await UserQuery.getBasicUserDataById(this.senderId)
        const receiverData = await UserQuery.getBasicUserDataById(this.receiverId)

        if(senderData && receiverData)
        {
            this.sender = senderData
            this.receiver = receiverData
        }
        else
        {
            throw new BadRequestError("Please Check User Infor")
        }
    }
  
    async toJsonObject() {
      await this.updateDeliveryData()
      return {
        typeNotify: this.typeNotify,
        from: this.sender,
        to: this.receiver
      };
    }

    async publishNotification()
    {
        const notifyMq = await RabbitMq.getInstance(NOTIFICATION_CONFIG?.EXCHANGES?.notify)
        const notifyJson = await this.toJsonObject()
        console.log(notifyJson)
        notifyMq.publishObject(notifyJson, NOTIFICATION_CONFIG?.NOTIFY_QUEUES?.notify)
    }
}

class FriendRequestNotify extends NotifyAbstract {
    constructor(senderId, receiverId)
    {
        super(NOTIFICATION_CONFIG?.TYPES?.friendRequest, senderId, receiverId)
    }
} 

class AnswereFriendRequestNotify extends NotifyAbstract {
    constructor(senderId, receiverId)
    {
        super(NOTIFICATION_CONFIG?.TYPES?.acceptedRequest, senderId, receiverId)
    }
}



// Notify Factory Method pattern
class NotifyFactory {
    constructor() {
    }
  
    createNotify(type, senderId, receiverId) {
      switch (type) {
        case NOTIFICATION_CONFIG?.TYPES?.friendRequest:
          return new FriendRequestNotify(senderId, receiverId);
        case NOTIFICATION_CONFIG?.TYPES?.acceptedRequest:
          return new AnswereFriendRequestNotify(senderId, receiverId);
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }
    }

    
    sendNotification(type, senderId, receiverId) {
        const notification = this.createNotify(type, senderId, receiverId);
        notification.publishNotification()
    }
}

class NotifyManager {
    static triggerNotify(type, senderId, receiverId)
    {
        const notifyFactory = new NotifyFactory()
        const notificer = notifyFactory.createNotify(type, senderId, receiverId)
        notificer.publishNotification()
    }
}

module.exports = {NotifyManager}