const fs = require("fs");
const { exec } = require("child_process");
const nearAPI = require("near-api-js");
const { formatNEAR, getContract, getDataSet } = require("./services/utils");

// maximum amount of gas you can attach to a single contract call
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
  let gasBurnt = [];
  let tokensBurnt = [];
  const result = await getKeyValuePair(contract, contractMethod, key);
  gasBurnt.push(result.transaction_outcome.outcome.gas_burnt);
  tokensBurnt.push(formatNEAR(result.transaction_outcome.outcome.tokens_burnt));
  for (let i = 0; i < result.receipts_outcome.length; i++) {
    gasBurnt.push(result.receipts_outcome[i].outcome.gas_burnt);
    tokensBurnt.push(
      formatNEAR(result.receipts_outcome[i].outcome.tokens_burnt)
    );
  }
  return {
    gas_burnt: gasBurnt.reduce((acc, cur) => acc + cur, 0),
    tokens_burnt: tokensBurnt.reduce((acc, curr) => acc + curr, 0),
  };
}

async function recordGasResults(contract, contractMethod, dataArr) {
  console.log(
    `Calling [ ${contract.contractId} ] using [ ${contractMethod} ]...`
  );
  let resultArr = [];
  for (let i = 0; i < dataArr.length; i++) {
    console.time("call_duration");
    console.log("call placed at:", new Date());
    const results = await calculateGas(contract, contractMethod, dataArr[i]);
    console.log(dataArr[i]);
    console.timeEnd("call_duration");
    console.log(results);
     // gas_burnt converts results into TGas (terra gas)
    resultArr.push({
      key: dataArr[i],
      gas_burnt: Number((results.gas_burnt / 1e12).toFixed(4)),
      tokens_burnt: results.tokens_burnt,
    });
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
  await recordGasResults(contract, "get_unordered_map", Object.keys(data));
  await recordGasResults(contract, "get_tree_map", Object.keys(data));
  exec("yarn getCharts");
}

// enter number of records to get from each map
// (make sure its the same amount as you added in setData.js)
getData(30);
