import config from '../../config/config';
import logging from '../../config/logging';
import commonService from './common';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

const NAMESPACE = 'Service: EVM Chain';

const getEvmChainHeaders = (): any => {
    return {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
    };
};

function getRpcUrl(network: string, testnet: boolean) {
    let rpcUrl = config.blockchain.eidSidechain.mainnet.rpcUrl;
    if (network === config.blockchain.chainEid) {
        if (testnet) {
            rpcUrl = config.blockchain.eidSidechain.testnet.rpcUrl;
        }
    } else if (network === config.blockchain.chainEsc) {
        if (testnet) {
            rpcUrl = config.blockchain.escSidechain.testnet.rpcUrl;
        } else {
            rpcUrl = config.blockchain.escSidechain.mainnet.rpcUrl;
        }
    } else if (network === config.blockchain.chainEth) {
        rpcUrl = config.blockchain.evmChain.chainEth.rpcUrl;
    } else if (network === config.blockchain.chainOptimism) {
        rpcUrl = config.blockchain.evmChain.chainOptimism.rpcUrl;
    } else if (network === config.blockchain.chainBsc) {
        rpcUrl = config.blockchain.evmChain.chainBsc.rpcUrl;
    } else if (network === config.blockchain.chainHeco) {
        rpcUrl = config.blockchain.evmChain.chainHeco.rpcUrl;
    } else if (network === config.blockchain.chainSongbird) {
        rpcUrl = config.blockchain.evmChain.chainSongbird.rpcUrl;
    }
    return rpcUrl;
}

async function getBlockHeight(network: string, testnet: boolean) {
    const web3 = new Web3(getRpcUrl(network, testnet));
    const res: any = await web3.eth
        .getBlockNumber()
        .then((height: any) => {
            if (height) {
                const data = {
                    height
                };
                return commonService.returnSuccess(network, 200, data);
            } else {
                return commonService.returnError(network, 401, 'Could not get height');
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getBalance(network: string, address: string, testnet: boolean) {
    const web3 = new Web3(getRpcUrl(network, testnet));
    const res: any = await web3.eth
        .getBalance(web3.utils.toChecksumAddress(address))
        .then((value: any) => {
            if (value) {
                const data = {
                    value: Number(web3.utils.fromWei(value))
                };
                return commonService.returnSuccess(network, 200, data);
            } else {
                return commonService.returnError(network, 401, 'Could not get balance');
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get balance of an address: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getTokenBalance(network: string, tokenAddress: string, walletAddress: string, testnet: boolean) {
    // The minimum ABI to get ERC20 Token balance
    const TOKEN_BALANCE_ABI: AbiItem[] = [
        // balanceOf
        {
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function'
        },
        // decimals
        {
            constant: true,
            inputs: [],
            name: 'decimals',
            outputs: [{ name: '', type: 'uint8' }],
            type: 'function'
        }
    ];

    const web3 = new Web3(getRpcUrl(network, testnet));
    const contract = new web3.eth.Contract(TOKEN_BALANCE_ABI, web3.utils.toChecksumAddress(tokenAddress));

    const res: any = await contract.methods
        .balanceOf(web3.utils.toChecksumAddress(walletAddress))
        .call()
        .then((value: any) => {
            if (value) {
                const data = {
                    value: Number(web3.utils.fromWei(value))
                };
                return commonService.returnSuccess(network, 200, data);
            } else {
                return commonService.returnError(network, 401, 'Could not get balance');
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get balance of an address: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getSupplyMtrl(network: string, tokenAddress: string, q: string) {
    const data = {
        value: 100000000
    };
    if (q === 'total' || q === 'max') {
        return commonService.returnSuccess(network, 200, data);
    } else {
        const balanceLiquidityWallet = await getTokenBalance(network, tokenAddress, '0x15a236cfbf5221f35ce9f83f56a646fe2950c624', false).then((balanceResponse) => {
            if (balanceResponse.meta.message === 'OK') {
                return balanceResponse.data.value;
            } else {
                return 0;
            }
        });
        const balanceTreasuryWallet = await getTokenBalance(network, tokenAddress, '0x6d337b9882a29c246faeba4c854830d8884fcca9', false).then((balanceResponse) => {
            if (balanceResponse.meta.message === 'OK') {
                return balanceResponse.data.value;
            } else {
                return 0;
            }
        });
        const userAcquisitionWallet = await getTokenBalance(network, tokenAddress, '0x5e7606c1fb2bdc171dfbd6c47bb909960992f735', false).then((balanceResponse) => {
            if (balanceResponse.meta.message === 'OK') {
                return balanceResponse.data.value;
            } else {
                return 0;
            }
        });
        const teamVestingWallet = await getTokenBalance(network, tokenAddress, '0x34312d7ccc11486bb725428773d5def8371c689b', false).then((balanceResponse) => {
            if (balanceResponse.meta.message === 'OK') {
                return balanceResponse.data.value;
            } else {
                return 0;
            }
        });
        const circSupply = 100000000 - (balanceLiquidityWallet + balanceTreasuryWallet + userAcquisitionWallet + teamVestingWallet);
        data.value = circSupply;
        return commonService.returnSuccess(network, 200, data);
    }
}

export default { getBlockHeight, getBalance, getTokenBalance, getSupplyMtrl };
