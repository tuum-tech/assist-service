import { NextFunction, request, Request, Response } from 'express';
import { Base64 } from 'js-base64';
import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import eidSidechainStats from '../../functions/stats/eidSidechain';
import commonFunction from '../../functions/common';
import accountFunction from '../../functions/account';
import commonService from '../../services/v1/common';
import rpcServiceEvm from '../../services/v1/evmRpc';
import IDidTx from '../../interfaces/didTx';

const NAMESPACE = 'Controller: EID Sidechain';

const publishDIDTx = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const { didRequest, memo, upgradeAccount } = req.body;
    let { network } = req.body;
    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;
    let did: any = null;
    try {
        let didRequestPayload = didRequest.payload;
        didRequestPayload = JSON.parse(Base64.decode(didRequestPayload + '='.repeat(didRequestPayload.length % 4)));
        did = didRequestPayload.id.replace('did:elastos:', '').split('#')[0];
    } catch (error) {
        logging.error(NAMESPACE, did, 'Error while trying to retrieve DID from the payload: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const costInUsd = 0.001;
    const account = await accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd);
    if (account.error) {
        logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
    }
    let requestFrom = {};
    if (account.user.did) {
        requestFrom = {
            username: account.user.username,
            did: account.user.did
        };
    } else {
        requestFrom = {
            username: account.user.username
        };
    }

    const didTx = await new conn.DidTx({
        _id: new mongoose.Types.ObjectId(),
        did,
        requestFrom,
        didRequest,
        memo,
        status: config.txStatus.pending
    }).save();

    const result = JSON.parse(JSON.stringify(didTx));
    result.confirmationId = result._id;
    const data = {
        didTx: result
    };

    if (Boolean(upgradeAccount) === true) {
        if (network === config.blockchain.mainnet) {
            if (account.user.accountType !== config.user.premiumAccountType) {
                account.user.accountType = config.user.premiumAccountType;
                account.user.requests.totalQuota = config.user.premiumAccountQuota;
                account.user.did = did;
                account.user.balance = 0;
            } else {
                const errMessage = 'This account is already upgraded to premium account. Nothing to do';
                logging.error(NAMESPACE, did, errMessage);
            }
        } else {
            const errMessage = 'The upgrade to premium feature is not available on the testnet';
            logging.error(NAMESPACE, did, errMessage);
        }
    }
    await account.user.save();
    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
};

const getAllDIDTxes = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const costInUsd = 0.1;
    const account = await accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd);
    if (account.error) {
        logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
    }

    const result: any = await conn.DidTx.find()
        .exec()
        .then((results: any) => {
            if (results.length === 0) {
                const error = 'Could not find any DID transactions';
                logging.error(NAMESPACE, '', 'Error while trying to get all the DID transactions', error);

                return res.status(404).json(commonService.returnError(network, 404, error));
            } else {
                const data = {
                    didTxes: results,
                    count: results.length
                };
                account.user.save();
                return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get all the DID transactions: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getDIDTxFromConfirmationId = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const _id = req.params.confirmationId;
    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const costInUsd = 0.0001;
    const account = await accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd);
    if (account.error) {
        logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
    }

    const didTx = await conn.DidTx.findOne({ _id }).exec();
    await account.user.save();
    const data = {
        didTx
    };
    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
};

const getDIDTxStats = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const dateString = req.query.created ? req.query.created.toString() : 'today';
    let beginDate = commonFunction.getDateFromString(dateString);
    if (beginDate == null) {
        const error = 'Date can only be passed in the following format: [today|yesterday|all|YYYY-MM-DD]';
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
    beginDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
    const endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
    if (dateString === 'all') {
        beginDate = null;
    }
    endDate.setDate(endDate.getDate() + 1);

    const costInUsd = 0.0001;
    const account = await accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd);
    if (account.error) {
        logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
    }

    const result: any = eidSidechainStats.getTxStats(network, beginDate, endDate).then((stats) => {
        if (stats.error !== null) {
            logging.error(NAMESPACE, '', 'Error while trying to get DID tx stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            const data = stats.data;
            let costInUsd = 0.001;
            if (dateString === 'all') {
                costInUsd = 0.01;
            }
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                .then((account) => {
                    if (account.error) {
                        logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
                        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    account.user.save();
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, '', 'Error while trying to verify account API quota', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        }
    });

    return result;
};

const getBlockInfoLatest = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const result: any = conn.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name })
        .exec()
        .then((data: any) => {
            const costInUsd = 0.001;
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                .then((account) => {
                    if (account.error) {
                        logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
                        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    account.user.save();
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, '', 'Error while trying to verify account API quota', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get the latest block info: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getTokenBalance = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const { tokenAddress, walletAddress } = req.body;
    let { network } = req.body;
    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    const isTestnet = network === config.blockchain.testnet ? true : false;

    const result: any = await rpcServiceEvm
        .getTokenBalance(config.blockchain.chainEid, tokenAddress, walletAddress, isTestnet)
        .then((balanceResponse) => {
            if (balanceResponse.meta.message === 'OK') {
                const data = {
                    value: balanceResponse.data.value
                };
                const costInUsd = 0.001;
                accountFunction
                    .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                    .then((account) => {
                        if (account.error) {
                            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
                            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        account.user.save();
                        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, '', 'Error while trying to verify account API quota', error);

                        return res.status(500).json(commonService.returnError(network, 500, error));
                    });
            } else {
                logging.error(NAMESPACE, '', `Error while getting balance of '${walletAddress}' for the token '${tokenAddress}': `, balanceResponse.error);
                return res.status(balanceResponse.meta.code).json(commonService.returnError(network, balanceResponse.meta.code, balanceResponse.error));
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, '', 'Error while trying to get balance of an address: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

export default {
    publishDIDTx,
    getAllDIDTxes,
    getDIDTxFromConfirmationId,
    getDIDTxStats,
    getBlockInfoLatest,
    getTokenBalance
};
