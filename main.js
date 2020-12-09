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

// calculates total gas from each call
async function calculateGas(obj) {
  let resultArr = [];
  const result = await addToTreeMapResult(obj.key, obj.value);
  resultArr.push(result.transaction_outcome.outcome.gas_burnt);
  for (let i = 0; i < result.receipts_outcome.length; i++) {
    resultArr.push(result.receipts_outcome[i].outcome.gas_burnt);
  }
  return resultArr.reduce((a, b) => a + b, 0);
}

async function writeResults(arr) {
  let resultArr = [];
  for (let i = 0; i < arr.length; i++) {
    const result = await calculateGas(arr[i]);
    resultArr.push(result);
    console.log(result);
    fs.writeFileSync("result.json", JSON.stringify(resultArr));
  }
}

writeResults(data);
