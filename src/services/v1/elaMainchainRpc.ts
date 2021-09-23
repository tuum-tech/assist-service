import config from '../../config/config';
import logging from '../../config/logging';
import commonService from './common';
import bytebuffer from 'bytebuffer';

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

async function getRawTransaction(network: string, txHash: string) {
    const body: any = {
        method: 'getrawtransaction',
        params: {
            txid: txHash,
            verbose: true
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
                    tx: r.data.result
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get raw transaction: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getMemoFromTransaction(network: string, txHash: string) {
    const res: any = await getRawTransaction(network, txHash)
        .then((r: any) => {
            if (r.error) {
                return commonService.returnError(network, 500, r.error);
            } else {
                const attributes = r.data.tx.attributes;
                const memo = { type: 'Invalid', message: '', amount: 0 };
                for (const attribute of attributes) {
                    if (attribute.usage === 129) {
                        const attData = bytebuffer.fromHex(attribute.data).readIString();
                        const attDataArr = attData.split(',');
                        const memoType = attDataArr[0].split(':')[1];
                        const memoMessage = attDataArr[1].split(':')[1];
                        const vout = r.data.tx.vout;
                        for (const v of vout) {
                            if (v.address === config.server.paymentElaAddress) {
                                memo.type = memoType;
                                memo.message = memoMessage;
                                memo.amount = Number(v.value);
                                break;
                            }
                        }
                    }
                }
                const data = {
                    memo
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get memo from the transaction: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

export default { getBlockHeight, getBlockInfoByHeight, getRawTransaction, getMemoFromTransaction };
