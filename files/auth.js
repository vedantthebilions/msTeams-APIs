const msal = require('@azure/msal-node');

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
    // auth: {
    //     clientId: process.env.CLIENT_ID,
    //     authority: process.env.AAD_ENDPOINT + '/' + process.env.TENANT_ID,
    //     clientSecret: process.env.CLIENT_SECRET,
    // }
    auth: {
        clientId: "27b4c3f0-58a6-41ea-8cd8-672448a5960e",
        authority: 'https://login.microsoftonline.com' + '/' + "8d6cd862-aca1-490d-9dde-c5aa72052b0b",
        clientSecret: "jlj8Q~Vq3EP5LiccsxJ9AiFTlLyM-PUeMHN6VcKE",
    }
};

/**
 * With client credentials flows permissions need to be granted in the portal by a tenant administrator.
 * The scope is always in the format '<resource>/.default'. For more, visit:
 * https://learn.microsoft.com/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
 */
const tokenRequest = {
    scopes: ['https://graph.microsoft.com' + '/.default']
};

// const scopesDelegate = ["https://graph.microsoft.com/OnlineMeetings.Read", "https://graph.microsoft.com/Chat.Read", "https://graph.microsoft.com/User.Read", "https://graph.microsoft.com/Mail.Read", "https://graph.microsoft.com/MailboxSettings.Read", "https://graph.microsoft.com/OnlineMeetingArtifact.Read.All", "https://graph.microsoft.com/OnlineMeetingRecording.Read.All", "https://graph.microsoft.com/OnlineMeetings.Read", "https://graph.microsoft.com/OnlineMeetings.ReadWrite"];
const scopesDelegate = ["OnlineMeetings.Read", "Chat.Read", "User.Read", "Mail.Read", "MailboxSettings.Read", "OnlineMeetingArtifact.Read.All", "OnlineMeetingRecording.Read.All", "OnlineMeetings.Read", "OnlineMeetings.ReadWrite"];

const apiConfig = {
    users: 'https://graph.microsoft.com/v1.0/users',
    call: 'https://graph.microsoft.com/v1.0/me/onlineMeetings',
    me: 'https://graph.microsoft.com/v1.0/me',
};

/**
 * Initialize a confidential client application. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md
 */
const cca = new msal.ConfidentialClientApplication(msalConfig);

/**
 * Acquires token with client credentials.
 * @param {object} tokenRequest
 */
async function getToken(request, typeOFCall = "") {
    if (typeOFCall && typeOFCall == "OBO") {
        return await cca.acquireTokenOnBehalfOf({
            oboAssertion: request,
            scopes: scopesDelegate,
            // authority: 'https://login.microsoftonline.com' + '/' + '8d6cd862-aca1-490d-9dde-c5aa72052b0b',
            // skipCache: false
        });
    }
    return await cca.acquireTokenByClientCredential(request);
}

module.exports = {
    apiConfig: apiConfig,
    tokenRequest: tokenRequest,
    getToken: getToken
};