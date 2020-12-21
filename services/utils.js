const nearAPI = require("near-api-js");
const userHome = require('user-home');
const data = require("./data");
require('dotenv').config();

// replace contractName with one that you have a full access key for
// if you do not already have keys stored locally use `near login` in your terminal to do so
const contractName = 'collections.' + process.env.NEAR_ACCOUNT;
const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(`${userHome}/.near-credentials`);

// constructs a local Contract object that allows you to interact with a NEAR smart contract
async function getContract() {
    const config = {
        keyStore,
        networkId: 'default',
        nodeUrl: 'https://rpc.testnet.near.org',
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

// gets X amount of sample data based on the value passed
const getDataSet = (maxVal) => {
  const delta = Math.floor(data.length / maxVal);
  let results = [];
  for (let i = 0; i < data.length; i=i+delta) {
    const element = data[i];
    results.push(element);
  }
  return results;
}

// converts yoctoNEAR (passed as a string) into standard Ⓝ as a float
const formatNEAR = (yoctoNEAR) => {
   return Number(
    nearAPI.utils.format.formatNearAmount(yoctoNEAR)
    ) 
}
module.exports = { contractName, getContract, getDataSet, formatNEAR };
