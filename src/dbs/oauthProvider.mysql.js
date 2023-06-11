const QueryBase = require('./queryBase');
const oauthProviderName = {
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    GITHUB: 'github'
  };
class OauthProviderQuery extends QueryBase {
    constructor(){
        super()
    }
    
    async addNewOauthProvider(userId, providerName, tokenId, accessToken) {
        await this.deleteOauthProvider(userId)
        const insertQuery = `INSERT INTO OAUTH_PROVIDERS (oauthProviderId, userId, providerName, tokenId, accessToken)
                             VALUES (UUID(),?, ?, ?, ?)`;
        await this.dbInstance.hitQuery(insertQuery, [userId, providerName, tokenId, accessToken]);
    }

    async getOauthProvider(userId)
    {
      try {
        const query = 'SELECT * FROM OAUTH_PROVIDERS WHERE userId = ? ';
        const result = await this.dbInstance.hitQuery(query, [userId]);
        return result.length > 0? result[0]: null;
      } 
      catch (error) {
        return null
      }
    }

    async deleteOauthProvider(userId)
    {
        const deleteQuery = `DELETE FROM OAUTH_PROVIDERS WHERE userId = ?`
        await this.dbInstance.hitQuery(deleteQuery, [userId]);
    }

}
const oauthProviderQuery = new OauthProviderQuery()
module.exports = {oauthProviderQuery, oauthProviderName}