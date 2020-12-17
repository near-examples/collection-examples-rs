const nearAPI = require("near-api-js");
const userHome = require('user-home');
const data = require("./data");

const contractName = 'my.words.testnet';
const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(`${userHome}/.near-credentials`);

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

const getDataSet = (maxVal) => {
  const delta = Math.floor(data.length / maxVal);
  let results = [];
  for (let i = 0; i < data.length; i=i+delta) {
    const element = data[i];
    results.push(element);
  }
  return results;
}

module.exports = { contractName, getContract, getDataSet };
