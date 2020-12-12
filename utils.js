require("dotenv").config({ path: './neardev/dev-account.env' });
const nearAPI = require("near-api-js");
const userHome = require('user-home');

const contractName = process.env.CONTRACT_NAME;
const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(`${userHome}/.near-credentials`);

// http://34.94.180.117:3030
// SLOW VVv
// http://34.94.158.10:3030

async function getContract() {
    const config = {
        keyStore,
        networkId: 'default',
        nodeUrl: 'http://34.94.180.117:3030',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org'
    }

    const near = await nearAPI.connect(config);
    const accountObj = await near.account(contractName);

    const methodArgs = {
        viewMethods: [
            "get_tree_map",
            "get_unordered_map",
            "get_lookup_map"
        ],
        changeMethods: [
            "add_tree_map",
            "add_unordered_map",
            "add_lookup_map" 
        ], 
        sender: contractName,
    };
    return new nearAPI.Contract(accountObj, contractName, methodArgs);
}

module.exports = { getContract };
