import config from '../../config/config';
import logging from '../../config/logging';
import commonService from './common';

const NAMESPACE = 'Service: ELA Mainchain';

const getElaMainchainHeaders = (): any => {
    return {
        Accepts: 'application/json',
        'Content-Type': 'application/json'
    };
};

async function getBlockHeight(network: string) {
    const body: any = {
        method: 'getblockcount'
    };
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.elaMainchain.mainnet.rpcUrl : config.blockchain.elaMainchain.testnet.rpcUrl;
    const res: any = await commonService
        .handleRoute(rpcUrl, body, getElaMainchainHeaders(), true)
        .then((r: any) => {
            if (r.error) {
                return commonService.returnError(network, 500, r.error);
            } else {
                const data = {
                    height: r.data.result
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getBlockInfoByHeight(network: string, height: number) {
    const body: any = {
        method: 'getblockbyheight',
        params: {
            height
        }
    };
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.elaMainchain.mainnet.rpcUrl : config.blockchain.elaMainchain.testnet.rpcUrl;
    const res: any = await commonService
        .handleRoute(rpcUrl, body, getElaMainchainHeaders(), true)
        .then((r: any) => {
            if (r.error) {
                return commonService.returnError(network, 500, r.error);
            } else {
                const data = {
                    block: r.data.result
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get block height: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

export default { getBlockHeight, getBlockInfoByHeight };
