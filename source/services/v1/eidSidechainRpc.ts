import config from '../../config/config';
import logging from '../../config/logging';

const NAMESPACE = 'Service: EID Sidechain';

const Web3 = require('web3');

const getEidSidechainHeaders = (): any => {
    return {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
    };
};

async function signTx(network: string, wallet: any, payload: string, index: number = 0) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    const contractAddress = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.contractAddress : config.blockchain.eidSidechain.testnet.contractAddress;
    const chainId = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.chainId : config.blockchain.eidSidechain.testnet.chainId;

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

    const res: any = {
        txDetails: {},
        error: null
    };
    try {
        let web3 = new Web3(rpcUrl);
        let contract = new web3.eth.Contract(PUBLISH_CONTRACT_ABI, contractAddress);

        const account = web3.eth.accounts.decrypt(wallet, config.blockchain.eidSidechain.wallets.pass);
        const walletAddress = web3.utils.toChecksumAddress(account['address']);
        res.walletUsed = walletAddress;
        const privateKey = account['privateKey'];

        let data = contract.methods.publishDidTransaction(payload).encodeABI();
        // We're adding index to the nonce so we can keep on sending transactions to the blockchain one after another
        // just by increasing the nonce
        let nonce: any = await web3.eth.getTransactionCount(walletAddress).then((n: any) => {
            return n + index;
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

        let to = web3.utils.toChecksumAddress(contractAddress);

        const tx = {
            nonce,
            to,
            gas,
            gasPrice,
            data,
            chainId
        };

        let signedTx: any = await web3.eth.accounts.signTransaction(tx, privateKey).then((result: any) => {
            return result;
        });
        res.txDetails.rawTx = signedTx['rawTransaction'];
    } catch (err) {
        logging.info(NAMESPACE, 'Error while trying to sign the DID transaction:', err);
        res.error = err;
    }

    return res;
}

async function getBlockHeight(network: string) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    let web3 = new Web3(rpcUrl);
    const res: any = await web3.eth
        .getBlockNumber()
        .then((height: any) => {
            if (height) {
                return {
                    _status: 'OK',
                    network,
                    height
                };
            } else {
                return {
                    _status: 'ERR',
                    network,
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
                network,
                _error: {
                    code: 500,
                    message: err
                }
            };
        });
    return res;
}

async function getBalance(network: string, address: string) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    let web3 = new Web3(rpcUrl);
    const res: any = await web3.eth
        .getBalance(web3.utils.toChecksumAddress(address))
        .then((value: any) => {
            if (value) {
                return {
                    _status: 'OK',
                    network,
                    value: Number(web3.utils.fromWei(value))
                };
            } else {
                return {
                    _status: 'ERR',
                    network,
                    _error: {
                        code: 401,
                        message: 'Could not get balance'
                    }
                };
            }
        })
        .catch((err: any) => {
            logging.error(NAMESPACE, 'Error while trying to get balance of an address: ', err);

            return {
                _status: 'ERR',
                network,
                _error: {
                    code: 500,
                    message: err
                }
            };
        });
    return res;
}

async function resolve_did(network: string, did: string) {
    const body: any = {
        method: 'did_resolveDID',
        params: [
            {
                did
            }
        ],
        id: '1'
    };

    const ret: any = await handleRoute(network, url, body, getEidSidechainHeaders(), true);

    const fetchResponse = await fetch(`https://api.github.com/repos/${req.params.owner}/${req.params.repos}/issues`, postData);
    const response = await fetchResponse.json();

    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    let web3 = new Web3(rpcUrl);
    const res: any = await web3.eth
        .getBalance(web3.utils.toChecksumAddress(address))
        .then((value: any) => {
            if (value) {
                return {
                    _status: 'OK',
                    network,
                    value: Number(web3.utils.fromWei(value))
                };
            } else {
                return {
                    _status: 'ERR',
                    network,
                    _error: {
                        code: 401,
                        message: 'Could not get balance'
                    }
                };
            }
        })
        .catch((err: any) => {
            logging.error(NAMESPACE, 'Error while trying to get balance of an address: ', err);

            return {
                _status: 'ERR',
                network,
                _error: {
                    code: 500,
                    message: err
                }
            };
        });
    return res;
}

export default { signTx, getBlockHeight, getBalance };
