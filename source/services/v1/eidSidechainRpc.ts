import config from '../../config/config';
import logging from '../../config/logging';

const NAMESPACE = 'Service: EID Sidechain';

const Web3 = require('web3');

async function getBlockHeight() {
    const web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);
    const res: any = await web3.eth
        .getBlockNumber()
        .then((height: any) => {
            if (height) {
                return {
                    _status: 'OK',
                    height
                };
            } else {
                return {
                    _status: 'ERR',
                    _error: {
                        code: 401,
                        message: 'Could not get height'
                    }
                };
            }
        })
        .catch((err: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', err);

            return {
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            };
        });
    return res;
}

async function sendTx(wallet: any, payload: string) {
    const PUBLISH_CONTRACT_ABI = [
        {
            inputs: [],
            stateMutability: 'nonpayable',
            payable: false,
            type: 'constructor'
        },
        {
            inputs: [
                {
                    internalType: 'string',
                    name: 'data',
                    type: 'string'
                }
            ],
            name: 'publishDidTransaction',
            outputs: [],
            stateMutability: 'nonpayable',
            payable: false,
            type: 'function'
        }
    ];

    let web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);
    let contract = new web3.eth.Contract(PUBLISH_CONTRACT_ABI, config.blockchain.eidSidechain.contractAddress);

    const account = web3.eth.accounts.decrypt(wallet, config.blockchain.eidSidechain.wallets.walletPass);
    const walletAddress = web3.utils.toChecksumAddress(account['address']);
    const privateKey = account['privateKey'];

    let data = contract.methods.publishDidTransaction(payload).encodeABI();
    let nonce: any = await web3.eth.getTransactionCount(walletAddress).then((n: any) => {
        return n;
    });
    let gas = 1000000;
    try {
        // Estimate gas cost
        gas = await contract.methods.publishDidTransaction(payload).estimateGas({
            from: walletAddress,
            gas: 1000000
        });
    } catch (error) {
        logging.info(NAMESPACE, 'Error while trying to estimate gas:', error);
    }
    let gasPrice = await web3.eth.getGasPrice();

    let to = web3.utils.toChecksumAddress(config.blockchain.eidSidechain.contractAddress);

    const tx = {
        nonce,
        to,
        gas,
        gasPrice,
        data,
        chainId: config.blockchain.eidSidechain.chainId
    };

    let signedTx: any = await web3.eth.accounts.signTransaction(tx, privateKey).then((result: any) => {
        return result;
    });

    let txDetails = {
        rawTx: signedTx['rawTransaction'],
        walletUsed: walletAddress
    };

    return txDetails;
}

export default { getBlockHeight, sendTx };
