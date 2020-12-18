const fs = require("fs");
const { exec } = require("child_process");
const { getContract, getDataSet } = require("./services/utils");

// maximum amount of gas you can attache to a single contract call
// all unused gas will be refunded to your account
const MAX_GAS = "300000000000000";

async function getKeyValuePair(contract, contractMethodString, key) {
  const result = await contract.account.functionCall(
    contract.contractId,
    contractMethodString,
    { key },
    MAX_GAS
  );
  return result;
}

async function calculateGas(contract, contractMethod, key) {
  let resultArr = [];
  const result = await getKeyValuePair(contract, contractMethod, key);
  resultArr.push(result.transaction_outcome.outcome.gas_burnt);
  for (let i = 0; i < result.receipts_outcome.length; i++) {
    resultArr.push(result.receipts_outcome[i].outcome.gas_burnt);
  }
  return resultArr.reduce((acc, curr) => acc + curr, 0);
}

async function recordGasResults(contract, contractMethod, dataArr) {
  console.log(
    `Calling [ ${contract.contractId} ] using [ ${contractMethod} ]...`
  );
  let resultArr = [];
  for (let i = 0; i < dataArr.length; i++) {
    const timeBeforeCall = Date.now();
    const gasBurnt = await calculateGas(contract, contractMethod, dataArr[i]);
    const timeAfterCall = Date.now();
    const responseTime = (timeAfterCall - timeBeforeCall) / 1000 + " sec.";
    let result = {};
    result[dataArr[i]] = gasBurnt;
    resultArr.push(result);
    console.log(gasBurnt, responseTime, dataArr[i]);
    fs.writeFileSync(
      `results/user-results/get-data/${contractMethod}_results.js`,
      `const ${contractMethod}_data = ${JSON.stringify(resultArr)}`
    );
  }
}

async function getData(amount) {
  const contract = await getContract();
  const data = getDataSet(amount);
  await recordGasResults(contract, "get_lookup_map", Object.keys(data));
  await recordGasResults(contract, "get_tree_map", Object.keys(data));
  await recordGasResults(contract, "get_unordered_map", Object.keys(data));
  exec("yarn getcharts");
}

// enter number of records to get from each map 
// (make sure its the same amount as you entered)
getData(60);
