const axios = require('axios');

const getApi  = async (url) =>
{
    console.log(`BE call GET api for ${url}`)
    try {
        const result = await axios.get(url)
        console.log(result)
        return result.data
    } catch (error) {
        console.log(error)
        return error
    }
}

const putApi  = async (url) =>
{
    console.log(`BE call PUT api for ${url}`)
    try {
        const result = await axios.put(url)
        console.log(result)
        return result.data
    } catch (error) {
        console.log(error)
        return error
    }
}

module.exports = {getApi, putApi}