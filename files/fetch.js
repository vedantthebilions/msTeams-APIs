const axios = require('axios');

/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} endpoint
 * @param {string} accessToken
 */
async function callApi(endpoint, accessToken) {

    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    };

    console.log('request made to web API at: ' + new Date().toString());

    try {
        const response = await axios.get(endpoint, options);
        return response.data;
    } catch (error) {
        console.log(error)
        return error;
    }
};


async function postAPI(endpoint, accessToken,ContentType , body) {

    const options = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': ContentType
        }
    };

    // console.log(options)
    // console.log('request made to web API at: ' + new Date().toString());

    try {
        const response = await axios.post(endpoint, body, options);
        console.log('post data', response)
        return response.data;
    } catch (error) {
        console.log(error)
        return error;
    }
};

module.exports = {
    callApi: callApi,
    postAPI: postAPI
};