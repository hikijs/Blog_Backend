const Database = require('./init.mysql');
class QueryBase {
    constructor()
    {
        this.dbInstance = Database.getInstance()
    }
}

module.exports = QueryBase