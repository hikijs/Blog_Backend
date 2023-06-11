const instanceMySqlDB = require('./init.mysql');
const { post } = require('../routers');
const { BadRequestError } = require('../core/error.response');
const QueryBase = require('./queryBase');

class ImageData extends QueryBase{
    constructor()
    {
      super()
    }
    async insertImageToDb(imageUrl, topic, userId=null, postId=null)
    {
      try {
        await this.upSertImage(imageUrl, topic, userId, postId)
        const imageId = await this.getImageFromUrl(imageUrl)
        return imageId;
      }
      catch (error) {
        throw new BadRequestError("The issue when uploading image ", 400)
      }
    }

    async getImageFromUrl(imageUrl)
    {
      try {
        const getImageInserted = 'SELECT * FROM IMAGE WHERE imageUrl = ?';
        const imageId = await this.dbInstance.hitQuery(getImageInserted, [imageUrl]);
        return imageId
      } catch (error) {
        throw new Error("Can not get image that was upserted")
      }
    }

    async upSertImage(imageUrl, topic, userId, postId)
    {
      try {
        if(topic == 'avatar' )
        {
          const queryAvatar = "SELECT * FROM IMAGE WHERE userId = ? AND topic = ?";
          const avatarExisting = await this.dbInstance.hitQuery(queryAvatar, [userId, topic]);
          if(avatarExisting.length == 1)
          {
            // FIXME should delete image on disk also
            const query = "UPDATE IMAGE SET imageUrl = ? WHERE userId = ? and topic = ?"
            const result = await this.dbInstance.hitQuery(query, [imageUrl, userId, topic])
            if(result.affectedRows == 0)
            {
              throw new Error("No Avatar was updated")
            }
            console.log('UPDATE: the existing image in db was updated successfully')
            return;
          } 
        }
        else if (topic == 'thumnail')
        {
          const queryThumbnail = "SELECT * FROM IMAGE WHERE postId = ? AND topic = ?";
          const thumbnailExisting = await this.dbInstance.hitQuery(queryThumbnail, [postId, topic]);
          if(thumbnailExisting.length == 1)
          {
              // FIXME should delete image on disk also
              const query = "UPDATE IMAGE SET imageUrl = ? WHERE postId = ? and topic = ?"
              const result = await this.dbInstance.hitQuery(query, [imageUrl, postId, topic])
              if(result.affectedRows == 0)
              {
                throw new Error("No Thumbnail was updated")
              }
              console.log('UPDATE: the existing image in db was updated successfully')
              return
          }
        }
        // inserted new
        const query = 'INSERT INTO IMAGE (imageId, imageUrl, topic, postId, userId)\
                        VALUES (UUID(), ?, ?, ?, ?)';
        const result = await this.dbInstance.hitQuery(query, [imageUrl, topic, postId, userId]);
        if(result.affectedRows != 1)
        {
          throw new Error("Can not insert new image")
        }
        console.log('INSERT: the new image was inserted successfully')
      }
      catch (error) {
        console.log(error)
        throw new BadRequestError("The issue when uploading image ", 400)
      }
    }
}

module.exports = new ImageData()