const instanceMySqlDB = require('./init.mysql');
class QueryBase {
    constructor()
    {
        this.dbInstance = instanceMySqlDB
    }
}

module.exports = QueryBase