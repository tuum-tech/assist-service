import config from '../../config/config';
import logging from '../../config/logging';
import commonService from './common';
import evmSidechainFunc from '../../functions/evmSidechain';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

const NAMESPACE = 'Service: EID Sidechain';

const getEidSidechainHeaders = (): any => {
    return {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
    };
};

async function signTx(network: string, wallet: any, payload: string, index: number = 0) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    const contractAddress = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.didContractAddress : config.blockchain.eidSidechain.testnet.didContractAddress;
    const chainId = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.chainId : config.blockchain.eidSidechain.testnet.chainId;

    const PUBLISH_CONTRACT_ABI: AbiItem[] = [
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
        const web3 = new Web3(rpcUrl);
        const contract = new web3.eth.Contract(PUBLISH_CONTRACT_ABI, contractAddress);

        const account = web3.eth.accounts.decrypt(wallet, config.blockchain.eidSidechain.wallets.pass);
        const walletAddress = web3.utils.toChecksumAddress(account.address);
        res.walletUsed = walletAddress;
        const privateKey = account.privateKey;

        const data = contract.methods.publishDidTransaction(payload).encodeABI();
        // We're adding index to the nonce so we can keep on sending transactions to the blockchain one after another
        // just by increasing the nonce
        const nonce: any = await web3.eth.getTransactionCount(walletAddress).then((n: any) => {
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
        const gasPrice = await web3.eth.getGasPrice();

        const to = web3.utils.toChecksumAddress(contractAddress);

        const tx = {
            nonce,
            to,
            gas,
            gasPrice,
            data,
            chainId
        };

        const signedTx: any = await web3.eth.accounts.signTransaction(tx, privateKey).then((result: any) => {
            return result;
        });
        res.txDetails.rawTx = signedTx.rawTransaction;
    } catch (err) {
        logging.info(NAMESPACE, 'Error while trying to sign the DID transaction:', err);
        res.error = err;
    }

    return res;
}

async function getBlockHeight(network: string) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    const res: any = await evmSidechainFunc.getBlockHeight(network, rpcUrl);
    return res;
}

async function getBalance(network: string, address: string) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    const res: any = await evmSidechainFunc.getBalance(network, rpcUrl, address);
    return res;
}

async function resolveDid(network: string, did: string) {
    const body: any = {
        method: 'did_resolveDID',
        params: [
            {
                did
            }
        ],
        id: '1'
    };
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.eidSidechain.mainnet.rpcUrl : config.blockchain.eidSidechain.testnet.rpcUrl;
    const res: any = await commonService.handleRoute(rpcUrl, body, getEidSidechainHeaders(), true);
    if (res.error) {
        return commonService.returnError(network, 500, res.error);
    }
    return commonService.returnSuccess(network, 200, res.data);
}

export default { signTx, getBlockHeight, getBalance, resolveDid };
