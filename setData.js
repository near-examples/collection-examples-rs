const fs = require("fs");
const { exec } = require("child_process");
const { formatNEAR, getContract, getDataSet } = require("./services/utils");

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
  let gasBurnt = [];
  let tokensBurnt = [];
  const result = await addKeyValuePair(
    contract,
    contractMethod,
    dataObj.key,
    dataObj.value
  );
  gasBurnt.push(result.transaction_outcome.outcome.gas_burnt);
  tokensBurnt.push(
    formatNEAR(result.transaction_outcome.outcome.tokens_burnt)
    );
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
      key: dataArr[i].key,
      gas_burnt: Number((results.gas_burnt / 1e12).toFixed(4)),
      tokens_burnt: results.tokens_burnt,
    });
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

setData(data);
