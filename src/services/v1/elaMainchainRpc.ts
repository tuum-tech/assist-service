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
            logging.error(NAMESPACE, '', 'Error while trying to get block height: ', error);

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
            logging.error(NAMESPACE, '', 'Error while trying to get block height: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getBalance(network: string, address: string) {
    const body: any = {
        method: 'getreceivedbyaddress',
        params: {
            address
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
                    value: Number(r.data.result)
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get balance of an address: ', error);

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
            logging.error(NAMESPACE, '', 'Error while trying to get raw transaction: ', error);

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
            logging.error(NAMESPACE, '', 'Error while trying to get memo from the transaction: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getMiningInfo(network: string) {
    const body: any = {
        method: 'getmininginfo',
        params: {}
    };
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.elaMainchain.mainnet.rpcUrl : config.blockchain.elaMainchain.testnet.rpcUrl;
    const res: any = await commonService
        .handleRoute(rpcUrl, body, getElaMainchainHeaders(), true)
        .then((r: any) => {
            if (r.error) {
                return commonService.returnError(network, 500, r.error);
            } else {
                const data = {
                    blocks: r.data.result.blocks,
                    currentBlockTx: r.data.result.currentblocktx,
                    difficulty: r.data.result.difficulty,
                    networkHashPs: r.data.result.networkhashps
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get mining info: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

async function getDPoSValidators(network: string, height: number = 0) {
    const rpcUrl = network === config.blockchain.mainnet ? config.blockchain.elaMainchain.mainnet.rpcUrl : config.blockchain.elaMainchain.testnet.rpcUrl;

    const arbitersInfo = {
        data: {
            startHeight: height,
            currentArbiter: '',
            nextArbiter: '',
            arbiters: [],
            candidates: []
        },
        error: null
    };

    let body: any = {
        method: 'getconfirmbyheight',
        params: {
            height,
            verbosity: 1
        }
    };
    await commonService
        .handleRoute(rpcUrl, body, getElaMainchainHeaders(), true)
        .then((r: any) => {
            if (r.error) {
                arbitersInfo.error = r.error;
            } else {
                arbitersInfo.data.currentArbiter = r.data.result.sponsor;
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get block info by height: ', error);

            arbitersInfo.error = error;
        });
    if (arbitersInfo.error !== null) {
        return commonService.returnError(network, 500, arbitersInfo.error);
    }

    body = {
        method: 'getarbitersinfo'
    };
    await commonService
        .handleRoute(rpcUrl, body, getElaMainchainHeaders(), true)
        .then((r: any) => {
            if (r.error) {
                arbitersInfo.error = r.error;
            } else {
                if (height >= r.data.result.currentturnstartheight && height < r.data.result.nextturnstartheight) {
                    arbitersInfo.data.startHeight = r.data.result.currentturnstartheight;
                    arbitersInfo.data.arbiters = r.data.result.arbiters;
                    arbitersInfo.data.candidates = r.data.result.candidates;
                } else if (height >= r.data.result.nextturnstartheight) {
                    arbitersInfo.data.startHeight = r.data.result.nextturnstartheight;
                    arbitersInfo.data.arbiters = r.data.result.nextarbiters;
                    arbitersInfo.data.candidates = r.data.result.nextcandidates;
                }
                for (const [index, arbiter] of r.data.result.arbiters.entries()) {
                    if (arbiter === arbitersInfo.data.currentArbiter) {
                        if (index === r.data.result.arbiters.length - 1) {
                            arbitersInfo.data.nextArbiter = r.data.result.nextarbiters[0];
                        } else {
                            arbitersInfo.data.nextArbiter = r.data.result.arbiters[index + 1];
                        }
                        break;
                    }
                }
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get arbiters info: ', error);

            arbitersInfo.error = error;
        });

    if (arbitersInfo.error !== null) {
        return commonService.returnError(network, 500, arbitersInfo.error);
    }
    body = {
        method: 'listproducers',
        params: {
            start: 0
        }
    };
    const res: any = await commonService
        .handleRoute(rpcUrl, body, getElaMainchainHeaders(), true)
        .then((r: any) => {
            if (r.error) {
                return commonService.returnError(network, 500, r.error);
            } else {
                const dposArbiters = [];
                const dposCandidates = [];
                let currentValidator = {};
                let nextValidator = {};
                // TODO: console.log(arbitersInfo.data.arbiters.length, arbitersInfo.data.arbiters);
                // TODO: console.log('current: ', arbitersInfo.data.currentArbiter);
                // TODO: console.log('next: ', arbitersInfo.data.nextArbiter);
                for (const validator of r.data.result.producers) {
                    for (const [index, arbiter] of arbitersInfo.data.arbiters.entries()) {
                        if (validator.nodepublickey === arbiter) {
                            // TODO: console.log('is a validator: ', index, validator.nodepublickey, validator.nickname);
                            const arbiterDetails = {
                                name: validator.nickname,
                                rank: Number(validator.index) + 1,
                                ondutyHeight: arbitersInfo.data.startHeight + index + 1,
                                ownerKey: validator.ownerpublickey,
                                nodeKey: validator.nodepublickey,
                                location: `${validator.location}`,
                                url: validator.url
                            };
                            dposArbiters.push(arbiterDetails);
                            if (validator.nodepublickey === arbitersInfo.data.currentArbiter) {
                                currentValidator = arbiterDetails;
                            }
                            if (validator.nodepublickey === arbitersInfo.data.nextArbiter) {
                                nextValidator = arbiterDetails;
                            }
                        }
                    }
                    for (const candidate of arbitersInfo.data.candidates) {
                        if (validator.nodepublickey === candidate) {
                            dposCandidates.push({
                                name: validator.nickname,
                                rank: Number(validator.index) + 1,
                                ownerKey: validator.ownerpublickey,
                                nodeKey: validator.nodepublickey,
                                location: `${validator.location}`,
                                url: validator.url
                            });
                        }
                    }
                }
                const data = {
                    currentValidator,
                    nextValidator,
                    dposArbiters,
                    dposCandidates,
                    totalVotes: Number(r.data.result.totalvotes)
                };
                return commonService.returnSuccess(network, 200, data);
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get mining info: ', error);

            return commonService.returnError(network, 500, error);
        });
    return res;
}

export default { getBlockHeight, getBlockInfoByHeight, getBalance, getRawTransaction, getMemoFromTransaction, getMiningInfo, getDPoSValidators };
