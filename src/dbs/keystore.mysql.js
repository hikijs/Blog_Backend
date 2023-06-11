const QueryBase = require('./queryBase');

class KeyStoreQuery extends QueryBase {
    constructor(){
        super()
    }
    async getKeyStore(userId)
    {
      try {
        const query = 'SELECT * FROM KEYSTORE WHERE userId = ? ';
        const result = await this.dbInstance.hitQuery(query, [userId]);
        return result.length > 0? result[0]: null;
      } 
      catch (error) {
        return null
      }
    }
    

    async addKeyStore(publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId) {
        await this.deleteKeyStore(userId)
        console.log(`Insert new keystore for user ${userId}`)
        const insertQuery = `INSERT INTO KEYSTORE (keyStoreId, publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId)
                             VALUES (UUID(),?, ?, ?, ?, ?, ?)`;
        await this.dbInstance.hitQuery(insertQuery, [publicKey, privateKey, accessToken, refreshToken, refreshTokenUsed, userId]);
        
        const getKeyIdQuery = 'SELECT LAST_INSERT_ID() AS keyStoreId';
        const keyIdResult = await this.dbInstance.hitQuery(getKeyIdQuery);
        return keyIdResult[0].id;
    }

    async deleteKeyStore(userId) {
        const checkQuery = 'SELECT 1 FROM KEYSTORE WHERE userId = ?';
        const checkResults = await this.dbInstance.hitQuery(checkQuery, [userId]);
        if (checkResults.length > 0)
        {
          console.log(`delete keystore for user ${userId}`)
          const deleteQuery = `DELETE FROM KEYSTORE WHERE userId = ?`;
          await this.dbInstance.hitQuery(deleteQuery, [userId]);
        }
    }
}

module.exports = new KeyStoreQuery()
