const { getContract } = require('./utils');

async function add_tree_map(key, value){
  const contract = await getContract();
  const result = await contract.add_tree_map({key, value});
  return result;
}

async function main(){
  result = await add_tree_map('hi', 'josh');
  console.log('result', result);
}

main();
