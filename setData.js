const fs = require("fs");
const { exec } = require("child_process");
const { getContract, getDataSet } = require("./services/utils");
const uniqueData = require("./services/uniqueData");

// maximum amount of gas you can attach to a single contract call
// all unused gas will be refunded to your account
const MAX_GAS = "300000000000000";

async function addKeyValuePair(contract, contractMethodString, key, value) {
  const result = await contract.account.functionCall(
    contract.contractId,
    contractMethodString,
    { key, value },
    MAX_GAS
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
  console.log(
    `Calling [ ${contract.contractId} ] using [ ${contractMethod} ]...`
  );
  let resultArr = [];
  for (let i = 0; i < dataArr.length; i++) {
    console.time('call_duration')
    console.log("call placed at:", new Date())
    const gasBurnt = await calculateGas(contract, contractMethod, dataArr[i]);
    console.timeEnd('call_duration')
    let result = {};
    result[dataArr[i].key] = gasBurnt;
    resultArr.push(result);
    console.log(gasBurnt, dataArr[i].key);
    fs.writeFileSync(
      `results/user-results/set-data/${contractMethod}_results.js`,
      `const ${contractMethod}_data = ${JSON.stringify(resultArr)}`
    );
  }
}

async function setData(data) {
  const contract = await getContract();
  await recordGasResults(contract, "add_lookup_map", data);
  await recordGasResults(contract, "add_unordered_map", data);
  await recordGasResults(contract, "add_tree_map", data);
  exec("yarn setcharts");
}

// enter number of records to add to each map (1 - 2000); 30 is default
const data = getDataSet(30);

// combinedData takes data already stored on the contract and combines it with
// unique data. This will show the difference gas costs for updating a keyValue pair vs. storing
// a new record on the existing collection.
const combinedData = data.concat(uniqueData);

setData(data);
