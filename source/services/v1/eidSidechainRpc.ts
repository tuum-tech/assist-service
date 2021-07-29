import config from '../../config/config';

var Web3 = require('web3');
// var web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);
var web3 = new Web3('https://api.elastos.io/eid');
var height = web3.eth.getBlockNumber();
height.then(console.log);
