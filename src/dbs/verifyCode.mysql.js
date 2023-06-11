const instanceMySqlDB = require('./init.mysql');
const { v4: uuidv4 } = require('uuid');
const { VERIFYCODE_TYPE } = require('../configs/configurations');
const QueryBase = require('./queryBase');

class VerifyCodeQuery extends QueryBase {
    constructor()
    {
      super()
    }
    async checkCodeForUserExist(userId)
    {
        try {
            const query = 'SELECT * FROM VERIFYCODE WHERE userId = ? '
            const results = await this.dbInstance.hitQuery(query, [userId]);
            if(results.length >= 1)
            {
                return results[0]
            }
            else
            {
                return null
            }
          } catch (error) {
            console.log(error)
            return null
          }
    }

    async checkCodeExistOrNot(code, userId, typeCode)
    {
        try {
            const query = "SELECT *  FROM VERIFYCODE WHERE code = ? AND userId = ? AND typeCode = ?"
            const results = await this.dbInstance.hitQuery(query, [code, userId, typeCode]);
            if(results.length == 1)
            {
              return results[0]
            }
            else
            {
              throw new Error("The verify code does not match")
            }
          } catch (error) {
            console.log(error)
            return null
          }
    }
    async createNewVerifyCode(code, expireTime, typeCode, userId) {
        try {
            // check if the userid exist in db or not
            var query = ""
            var codeId = uuidv4();
            const expireDate = new Date(expireTime);
            const existingCode = await this.checkCodeForUserExist(userId)
            try {
              if(existingCode)
              {
                  codeId = existingCode.codeId
                  query = 'UPDATE VERIFYCODE SET code = ? , expireTime = ?, typeCode = ?  \
                          WHERE codeId = ?';
                  await this.dbInstance.hitQuery(query, [code, expireDate, typeCode, codeId]);
              }
              else
              {
                  query = 'INSERT INTO VERIFYCODE (codeId, code, expireTime, typeCode, userId) \
                  VALUES (UUID(), ?, ?, ?, ?)';
                  await this.dbInstance.hitQuery(query, [code, expireDate, typeCode, userId]);
              }

              const verifyCodeSql = 'SELECT * FROM VERIFYCODE WHERE userId = ?';
              const verifyCode = await this.dbInstance.hitQuery(verifyCodeSql, [userId]);
              console.log(verifyCode)
              return verifyCode;
            } catch (error) {
              throw new Error("Can not process update password")
            }
            
          }
          catch (error) {
            console.log(error)
            return null
          }
    }

    async deleteVerifyCode(code, userId, typeCode)
    {
      if(await this.checkCodeExistOrNot(code,userId,typeCode) == null)
      {
        throw new Error("The code does not exist")
      }
      const query = 'DELETE FROM VERIFYCODE WHERE code = ? AND userId = ? '
      const results = await this.dbInstance.hitQuery(query, [code, userId]);
      if(results.affectedRows == 1) 
      {
        return true
      }
      else
      {
        return false
      }
    }
}

module.exports = new VerifyCodeQuery()