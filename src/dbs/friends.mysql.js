const instanceMySqlDB = require('./init.mysql');
const UserQuery = require('./user.mysql')
const { BadRequestError } = require('../core/error.response');
const QueryBase = require('./queryBase');
class FriendQuery extends QueryBase {
    constructor()
    {
        super()
    }

    async insertNewFriendRequest(requesterId, recipientId, status = "Pending")
    {
        const query = 'INSERT INTO FRIEND_REQUESTS (requestId, requesterId, recipientId, status)\
                        VALUES (UUID(), ?, ?, ?)';
        try {
            const insertResult = await this.dbInstance.hitQuery(query, [requesterId, recipientId, status]);
            if(insertResult.affectedRows != 1)
            {
                throw new Error("Insert new friend request failed")
            }
        }
        catch (error) {
            throw new BadRequestError("Some thing went wrong when making friend request")
        }
    }

    async updateFriendRequest(requesterId, recipientId, status)
    {
        if(status == 'Accepted' || status == 'Rejected' || status == 'Pending')
        {
            const query = "UPDATE FRIEND_REQUESTS SET status = ? WHERE requesterId = ? and recipientId = ?"
            await this.dbInstance.hitQuery(query, [status, requesterId, recipientId])
        }
        else
        {
            throw new BadRequestError("The status does not expectation, should be (Accepted ,Rejected or Pending)")
        }
    }

    async getAllFriendRequestsByStatus(recipientId, status = null)
    {
        let query = `SELECT FR.requesterId,
                            U1.userName AS requesterName,
                            FR.recipientId, 
                            U2.userName AS recipientName,
                            FR.status,
                            FR.created_at
                    FROM FRIEND_REQUESTS FR
                    LEFT JOIN USER U1 ON U1.userId = FR.requesterId
                    LEFT JOIN USER U2 ON U2.userId = FR.recipientId
                    WHERE FR.recipientId = ? `;
        let listParams = [recipientId]
        if(status)
        {
            query = query +  " AND FR.status = ?" 
            listParams.push(status)
        }
        try {
            const listFriendRequest = await this.dbInstance.hitQuery(query, listParams);
            return listFriendRequest
        }
        catch (error) {
            throw new BadRequestError("Some thing went wrong when making friend request")
        }
    }

    async upsertNewFriendRequest(requesterId, recipientId, status = 'Pending') {
        const isRequesterExist  = await UserQuery.checkUserExistById(requesterId)
        const isRecipientExist  = await UserQuery.checkUserExistById(recipientId)

        if(!isRequesterExist || !isRecipientExist)
        {
            throw new BadRequestError("There are some wrong related the existance of user")
        }

        const friendshipExistence = await this.checkIfTheyAreFriend(requesterId, recipientId)
        if(friendshipExistence)
        {
            throw new BadRequestError('You and this user is the friend right now')
        }

        const friendRequestExistence = await this.isFriendRequestExist(requesterId, recipientId)
        if(friendRequestExistence)
        {
            const previousAnswereRequest = await this.getStatusOfFriendRequest(requesterId, recipientId)
            if(previousAnswereRequest == "Pending" )
            {
                throw new BadRequestError("Your request are waiting for answere")
            }
            console.log("UPDATE existing friend request")
            await this.updateFriendRequest(requesterId, recipientId, status)
        }
        else
        {
            console.log("INSERT new friend request")
            await this.insertNewFriendRequest(requesterId, recipientId)
        }
    }

    async isFriendRequestExist(requesterId, recipientId, status=null)
    {
        let query = "SELECT COUNT(*) FROM FRIEND_REQUESTS WHERE requesterId = ? AND recipientId = ?";
        let listParams = [requesterId, recipientId]
        if(status)
        {
            query = query +  "AND status = ?"
            listParams.push(status)
        }
        const result = await this.dbInstance.hitQuery(query, listParams);
        return result[0]?.['COUNT(*)'] == 1
    }

    async getStatusOfFriendRequest(requesterId, recipientId)
    {
        const query = "SELECT status FROM FRIEND_REQUESTS WHERE requesterId = ? AND recipientId = ?";
        const result = await this.dbInstance.hitQuery(query, [requesterId, recipientId]);
        return result[0]?.['status']
    }

    async addNewFriendShip(userAId, userBId)
    {
        const friendlyExistence = await this.checkIfTheyAreFriend(userAId, userBId)
        if(friendlyExistence)
        {
            throw new BadRequestError('You and this user is the friend right now')
        }

        const query = `
        INSERT INTO FRIENDSHIPS (friendshipId, userAId, userBId)
        VALUES (UUID(), ?, ?),
               (UUID(), ?, ?)`;

        await this.dbInstance.hitQuery(query, [userAId, userBId, userBId, userAId]);
    }

    async checkIfTheyAreFriend(requesterId, recipientId)
    {
        const query = "SELECT COUNT(*) FROM FRIENDSHIPS\
                       WHERE userAId = ? and userBId = ?";
        const result = await this.dbInstance.hitQuery(query, [requesterId, recipientId]);
        return result[0]?.['COUNT(*)'] == 1
    
    }

    async deleteFriendShip(userAId, userBId)
    {
        const friendlyExistence = await this.checkIfTheyAreFriend(userAId, userBId)
        if(!friendlyExistence)
        {
            throw new BadRequestError('You and this user does not a friend right now')
        }
        const deleteQuery = `DELETE FROM FRIENDSHIPS
                             WHERE (userAId = ? AND userBId = ?)
                             OR (userAId = ? AND userBId = ?)`;
        const result = await this.dbInstance.hitQuery(deleteQuery, [userAId, userBId, userBId, userAId]);
        if(result.affectedRows != 2)
        {
            throw new BadRequestError("Some thing wrong when delete data")
        }
    }

    async getFriendOfUser(userId)
    {
        const query = `SELECT FS.userBId AS userId,
                            U.username,
                            I.imageUrl AS avatar
                        FROM FRIENDSHIPS FS
                        LEFT JOIN USER U ON U.userId = FS.userBId
                        LEFT JOIN IMAGE I ON I.userId = FS.userBId and I.topic = 'avatar'
                        WHERE FS.userAId = ?`
        const listFriends = await this.dbInstance.hitQuery(query, [userId]);
        return listFriends
    }

    async getTotalNotFriend(userId) 
    {
        const query = ` SELECT COUNT(*) AS total_records
                        FROM USER
                        WHERE userId NOT IN ( SELECT userBId FROM FRIENDSHIPS WHERE userAId = ?)
                            AND
                            userId NOT IN (
                                SELECT recipientId from FRIEND_REQUESTS WHERE requesterId = ? AND status <> 'Rejected'
                            ) AND userId <> ?;`
        const listNotFriendWithUser = await this.dbInstance.hitQuery(query, [userId, userId, userId]);
        console.log(listNotFriendWithUser)
        return listNotFriendWithUser[0].total_records
    }

    async getListNotFriendWithUser(userId, limit, offset)
    {
        
        const query = `
                    SELECT
                        ROW_NUMBER() OVER (ORDER BY U.userId) AS _index, 
                        U.userId, U.userName, U.bio,
                        I.imageUrl AS avatar
                    FROM USER U
                    LEFT JOIN FRIENDSHIPS F
                    ON U.userId = F.userBId AND F.userAId = ?
                    LEFT JOIN IMAGE I
                    ON U.userId = I.userId AND I.topic ='avatar'
                    WHERE F.userBId IS NULL AND U.userId <> ?
                    AND U.userId NOT IN (
                    	SELECT recipientId from FRIEND_REQUESTS WHERE requesterId = ? AND status <> 'Rejected'
                    )
                    ORDER BY U.userId
                    LIMIT ${limit} OFFSET ${offset};`

        console.log(query)
        const listNotFriendWithUser = await this.dbInstance.hitQuery(query, [userId, userId, userId]);
        return listNotFriendWithUser
    }
}

module.exports = new FriendQuery()