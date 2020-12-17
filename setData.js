const { getContract, getDataSet } = require("./services/utils");
const fs = require("fs");
const { exec } = require("child_process");
const uniqueData = require("./services/uniqueData");

// addTreeMap and addTreeMapGasRes perform _almost_ the same function
// the _only_ difference is addTreeMapGasRes returns result data
async function addToTreeMapSimple(key, value) {
  const contract = await getContract();
  await contract.add_tree_map({ key, value });
}

async function addKeyValuePair(contract, contractMethodString, key, value) {
  const result = await contract.account.functionCall(
    contract.contractId,
    contractMethodString,
    { key, value },
    "300000000000000"
  );
  return result;
}

async function calculateGas(contract, contractMethod, dataObj) {
  let resultArr = [];
  const result = await addKeyValuePair(
    contract,
    contractMethod,
    dataObj.key,
    dataObj.value
  );
  resultArr.push(result.transaction_outcome.outcome.gas_burnt);
  for (let i = 0; i < result.receipts_outcome.length; i++) {
    resultArr.push(result.receipts_outcome[i].outcome.gas_burnt);
  }
  return resultArr.reduce((acc, curr) => acc + curr, 0);
}

async function recordGasResults(contract, contractMethod, dataArr) {
  let resultArr = [];
  console.log(`Storing data to [ ${contract} ] using [ ${contractMethod} ]...`)
  for (let i = 0; i < dataArr.length; i++) {
    const timeBeforeCall = Date.now();
    const gasBurnt = await calculateGas(contract, contractMethod, dataArr[i]);
    const timeAfterCall = Date.now();
    const responseTime = (timeAfterCall - timeBeforeCall) / 1000 + " sec."
    let result = {};
    result[dataArr[i].key] = gasBurnt;
    resultArr.push(result);
    console.log(gasBurnt, responseTime, dataArr[i].key);
    fs.writeFileSync(
      `results/user-results/set-data/${contractMethod}_results.js`,
      `const ${contractMethod}_data = ${JSON.stringify(resultArr)}`
    );
  }
}

async function setData(amount) {
  const data = getDataSet(amount);
  // const combinedData = data.concat(uniqueData);
  const contract = await getContract();
  await recordGasResults(contract, "add_lookup_map", data);
  await recordGasResults(contract, "add_unordered_map", data);
  await recordGasResults(contract, "add_tree_map", data);
  exec('yarn my-charts');
}

 // enter number of records to add to each map (1 - 2000); 30 is default
setData(30);
