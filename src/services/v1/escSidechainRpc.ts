import config from '../../config/config';
import logging from '../../config/logging';
import commonService from './common';
import evmSidechainFunc from '../../functions/evmSidechain';

const NAMESPACE = 'Service: ESC Sidechain';

const getEscSidechainHeaders = (): any => {
    return {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
    };
};

async function getBlockHeight(network: string) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.escSidechain.mainnet.rpcUrl : config.blockchain.escSidechain.testnet.rpcUrl;
    const res: any = await evmSidechainFunc.getBlockHeight(network, rpcUrl);
    return res;
}

async function getBalance(network: string, address: string) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.escSidechain.mainnet.rpcUrl : config.blockchain.escSidechain.testnet.rpcUrl;
    const res: any = await evmSidechainFunc.getBalance(network, rpcUrl, address);
    return res;
}

export default { getBlockHeight, getBalance };
