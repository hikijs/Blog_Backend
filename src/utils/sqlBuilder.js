const { BadRequestError } = require('../core/error.response');
const {CONTRAINS_UPDATE_POST, CONTRAINS_UPDATE_USER} = require ('../configs/configurations');

function validateAttrUpdatePost (queryName, queryData)
{
    if(!CONTRAINS_UPDATE_POST.post.atributes.includes(queryName)){
        return false
    }
    switch (queryName) {
        case "statusEdit":
            if (!CONTRAINS_UPDATE_POST.post.statusEdit.includes(queryData)) {
                return false
            }
            break;
        case "sharePermission":
            if (!CONTRAINS_UPDATE_POST.post.sharePermission.includes(queryData)) {
                return false
            }
            break;
        default:
            break;
    }
    return true
}

function validateAttrUpdateUser (queryName, queryData)
{
    if(!CONTRAINS_UPDATE_USER.users.atributes.includes(queryName)){
        return false
    }
    return true
}
class SqlBuilder{
    static dynamicSqlForUpdatePostByPostId = (queries, postId)=>
    {
        const queryParams = [];
        let query = 'UPDATE POST SET';
        for (const queryName in queries)
        {
            console.log(queryName)
            const queryData = queries[queryName]
            if(!validateAttrUpdatePost(queryName, queryData))
            {
                throw new BadRequestError("The queries data is not correct")
            }
            if (queryData) {
                query += ` ${queryName} = ?,`;
                queryParams.push(queryData);
            }
        }
        // Remove the trailing comma from the query
        query = query.slice(0, -1);
        // Add your WHERE clause to specify the post you want to update
        query += ' WHERE postId = ?';
        queryParams.push(postId);
        return {query, queryParams}
    }

    static dynamicSqlForUpdateUserByUserId = (queries, userId)=>
    {
        const queryParams = [];
        let emailChange = false
        let query = 'UPDATE USER SET';
        for (const queryName in queries)
        {
            console.log(queryName)
            const queryData = queries[queryName]
            if(queryName == 'email')
            {
                emailChange = true
            }
            if(!validateAttrUpdateUser(queryName, queryData))
            {
                throw new BadRequestError("The queries data is not correct")
            }
            if (queryData) {
                query += ` ${queryName} = ?,`;
                queryParams.push(queryData);
            }
        }
        // Remove the trailing comma from the query
        query = query.slice(0, -1);
        // Add your WHERE clause to specify the post you want to update
        query += ' WHERE userId = ?';
        queryParams.push(userId);
        return {query, queryParams, emailChange}
    }
}

module.exports = SqlBuilder