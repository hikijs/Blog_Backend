const QueryBase = require('./queryBase')
const { v4: uuidv4 } = require('uuid');
const { BadRequestError } = require('../core/error.response');
class SaveListQuery extends QueryBase{
    constructor()
    {
        super()
    }
    async createNewSaveList(saveListId, nameList, userId)
    {
        const query = `INSERT INTO SAVELIST (saveListId, nameSaveList, userId) VALUES 
                        (?, ?, ?)`
        await this.dbInstance.hitQuery(query, [saveListId, nameList, userId])
    }

    async getSaveList(nameList, userId)
    {
        const query = `SELECT * FROM SAVELIST WHERE nameSaveList = ? AND userId = ?`
        const existingSaveList = await this.dbInstance.hitQuery(query, [nameList, userId])
        if(existingSaveList.length == 1)
        {
            return existingSaveList[0]
        }
        else if(existingSaveList.length > 1)
        {
            throw new Error("There are two savelist has same name")
        }
        else
        {
            return null
        }
    }

    async getSaveListById(saveListId, userId)
    {
        const query = `SELECT * FROM SAVELIST WHERE saveListId = ? AND userId = ?`
        const existingSaveList = await this.dbInstance.hitQuery(query, [saveListId, userId])
        if(existingSaveList.length == 1)
        {
            return existingSaveList[0]
        }
        else if(existingSaveList.length > 1)
        {
            throw new Error("There are more savelist has same id !!!")
        }
        else
        {
            return null
        }
    }

}
class SavePostQuery extends QueryBase{
    constructor()
    {
        super()
        this.saveListQuery = new SaveListQuery()
    }
    async getPostFromSaveList(savelistId, postId)
    {
        const query = `SELECT * FROM SAVELIST_POST WHERE saveListId = ? AND postId = ?`
        const existingSavePost = await this.dbInstance.hitQuery(query, [savelistId, postId])
        if(existingSavePost.length != 0)
        {
            return existingSavePost
        }
        else
        {
            return null
        }
    }

    async getPostsBySavelistId(savelistId)
    {
        const queryGetNumsPost = `SELECT COUNT(*) as total_record
                                  FROM SAVELIST_POST
                                  WHERE saveListId = ?`
        const coutingResult = await this.dbInstance.hitQuery(queryGetNumsPost, [savelistId])
        const numberPosts = coutingResult[0]['total_record']
        const query = ` SELECT  ROW_NUMBER() OVER (ORDER BY SP.created_at DESC) AS _index,
                                SP.saveListId, SP.created_at as savedAt,
                                U.userId, U.userName, U.bio, I2.imageUrl as avatarUrl,
                                SP.postId, P.title, P.summarize, I1.imageUrl as thumbnailUrl
                        FROM SAVELIST_POST SP
                        INNER JOIN POST P
                        ON SP.postId = P.postId
                        LEFT JOIN IMAGE I1
                        ON P.postId = I1.postId && I1.topic = 'thumnail'
                        LEFT JOIN IMAGE I2
                        ON P.userId = I2.userId && I2.topic = 'avatar'
                        INNER JOIN USER U 
                        ON P.userId = U.userId
                        WHERE SP.saveListId = ?
                        ORDER BY SP.created_at DESC;`
        const existingSavePost = await this.dbInstance.hitQuery(query, [savelistId])
        return {
            numberPosts,
            existingSavePost
        }

    }

    async saveNewPost(userId, nameList, postId)
    {
        // check if the nameList is existing or not, if not create new
        const existingSaveList = await this.saveListQuery.getSaveList(nameList, userId)
        let saveListId = null
        if(!existingSaveList)
        {
            saveListId = uuidv4();
            console.log(`DEBUG: create new SaveList ${nameList} with id ${saveListId}`)
            await this.saveListQuery.createNewSaveList(saveListId, nameList, userId)
        }
        else
        {
            saveListId = existingSaveList.saveListId
            console.log(`DEBUG: SaveList ${nameList} existed with id ${saveListId}`)
        }
        // in each savelist has only one postId
        if(! await this.getPostFromSaveList(saveListId, postId))
        {
            const saveListPostId = uuidv4()
            const query = `INSERT INTO SAVELIST_POST (saveListPostId, saveListId, postId)
                           VALUES (?, ?, ?)`
            await this.dbInstance.hitQuery(query, [saveListPostId, saveListId, postId])
            return await this.saveListQuery.getSaveListById(saveListId, userId)

        }
        else
        {
            console.warn(`The post ${postId} was saved in ${saveListId} already`)
            return await this.saveListQuery.getSaveListById(saveListId, userId)
        }
    }

    async unsavePost(userId, savelistId, postId)
    {
        // check if the nameList is existing or not, if not create new
        const existingSaveList = await this.saveListQuery.getSaveListById(savelistId, userId)
        if(!existingSaveList)
        {
            throw new Error(`The saveList ${savelistId} does not exist`)
        }
        const saveListId = existingSaveList.saveListId
        if(! await this.getPostFromSaveList(saveListId, postId))
        {
            console.log(`The post ${postId} was does not exist in savelist ${saveListId}`)
            throw new BadRequestError(`The post ${postId} was does not exist in savelist ${saveListId}`)
        }
        const query = `DELETE FROM SAVELIST_POST WHERE postId = ? AND saveListId = ?`
        await this.dbInstance.hitQuery(query, [postId, saveListId])
        return `The post with id ${postId} was unsave from list ${saveListId}`
    }

    async getSavedPost(saveListId, userId)
    {
        const existingSaveList = await this.saveListQuery.getSaveListById(saveListId, userId)
        let savePosts = []
        if(!existingSaveList)
        {
            return {savePosts}
        }
        savePosts = await this.getPostsBySavelistId(existingSaveList.saveListId)
        return {savePosts}
    }

    async getSavedListByUserId(userId)
    {
        const query = `SELECT saveListId, nameSaveList, created_at, updated_at
                       FROM SAVELIST WHERE userId = ?`
        const listSaveList = await this.dbInstance.hitQuery(query, [userId])
        if(listSaveList.length > 0)
        {
            return listSaveList
        }
        else
        {
            return []
        }
    }

    async deleteSavePostById(saveListId, userId)
    {
        const existingSaveList = await this.saveListQuery.getSaveListById(saveListId, userId)
        if(!existingSaveList)
        {
            throw new BadRequestError(`The savelist with id ${saveListId} does not exist`)
        }
        const query = `DELETE FROM SAVELIST WHERE saveListId = ? AND userId = ?`
        const deteleResult = await this.dbInstance.hitQuery(query, [saveListId, userId])
    }
    
}

module.exports = {SaveListQuery, SavePostQuery}