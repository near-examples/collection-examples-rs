const { getContract } = require("./utils");
const data = require("./data");
const fs = require("fs");

// addTreeMap and addTreeMapGasRes perform _almost_ the same function
// the _only_ difference is addTreeMapGasRes returns result data
async function addToTreeMapSimple(key, value) {
  const contract = await getContract();
  await contract.add_tree_map({ key, value });
}

async function addToTreeMapResult(key, value) {
  const contract = await getContract();
  const result = await contract.account.functionCall(
    contract.contractId,
    "add_tree_map",
    { key, value },
    "300000000000000"
  );
  return result;
}

async function addKeyValuePair(contractMethodString, key, value) {
  const contract = await getContract();
  const result = await contract.account.functionCall(
    contract.contractId,
    contractMethodString,
    { key, value },
    "300000000000000"
  );
  return result;
}

// calculates total gas from each call
async function calculateGas(contractMethod, dataObj) {
  let resultArr = [];
  const result = await addKeyValuePair(
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

async function writeResults(contractMethod, dataArr) {
  let resultArr = [];
  for (let i = 0; i < dataArr.length; i++) {
    const result = await calculateGas(contractMethod, dataArr[i]);
    resultArr.push(result);
    console.log(result);
    fs.writeFileSync("result.json", JSON.stringify(resultArr));
  }
}

// writeResults('add_tree_map', data);

// writeResults('add_lookup_map', data);

writeResults("add_unordered_map", data);
