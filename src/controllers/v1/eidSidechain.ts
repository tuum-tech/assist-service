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
import rpcService from '../../services/v1/eidSidechainRpc';
import IUser from '../../interfaces/user';

const NAMESPACE = 'Controller: EID Sidechain';

const publishDIDTx = (req: Request, res: Response, next: NextFunction) => {
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
        logging.error(NAMESPACE, 'Error while trying to retrieve DID from the payload: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }

    // TODO: Check if requestFrom DID is valid by resolving it

    // Select a random wallet to use
    const wallet = config.blockchain.eidSidechain.wallets.keystores[Math.floor(Math.random() * config.blockchain.eidSidechain.wallets.keystores.length)];

    // Verify whether the given payload is valid by trying to create a transaction out of it and then proceed
    // to the next step if valid
    const result: any = rpcService
        .signTx(network, wallet, JSON.stringify(didRequest))
        .then((r: any) => {
            if (r.error) {
                logging.error(NAMESPACE, 'Error while trying to sign the transaction: ', r.error);
            }
            return r.txDetails;
        })
        .then((txDetails) => {
            if (!txDetails.hasOwnProperty('rawTx')) {
                return false;
            } else {
                return true;
            }
        })
        .then((valid) => {
            if (!valid) {
                const error = 'txDetails does not have property rawTx';
                logging.error(NAMESPACE, 'Error while trying to sign the transaction:', error);

                return res.status(500).json(commonService.returnError(network, 500, error));
            } else {
                const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

                const costInUsd = 0.01;
                accountFunction
                    .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                    .then((account) => {
                        if (account.error) {
                            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        const user: IUser = account.user;
                        if (network === config.blockchain.mainnet && Boolean(upgradeAccount) === true) {
                            if (user.accountType !== config.user.premiumAccountType) {
                                user.accountType = config.user.premiumAccountType;
                                user.requests.totalQuota = config.user.premiumAccountQuota;
                                user.balance = 0;
                            }
                            user.did = did;
                        }
                        let requestFrom = {};
                        if (user.did) {
                            requestFrom = {
                                username: user.username,
                                did: user.did
                            };
                        } else {
                            requestFrom = {
                                username: user.username
                            };
                        }
                        const didTx = new conn.models.DidTx({
                            _id: new mongoose.Types.ObjectId(),
                            did,
                            requestFrom,
                            didRequest,
                            memo,
                            status: config.txStatus.pending
                        });
                        didTx
                            .save()
                            .then((r: any) => {
                                const _result = JSON.parse(JSON.stringify(r));
                                _result.confirmationId = _result._id;
                                const data = {
                                    didTx: _result
                                };
                                user.save();
                                return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                            })
                            .catch((error: any) => {
                                logging.error(NAMESPACE, 'Error while trying to save the DID tx to the database: ', error);

                                return res.status(500).json(commonService.returnError(network, 500, error));
                            });
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                        return res.status(500).json(commonService.returnError(network, 500, error));
                    });
            }
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to sign the transaction: ', error);

            return res.status(401).json(commonService.returnError(network, 401, error));
        });
    return result;
};

const getAllDIDTxes = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const result: any = conn.models.DidTx.find()
        .exec()
        .then((results) => {
            if (results.length === 0) {
                const error = 'Could not find any DID transactions';
                logging.error(NAMESPACE, 'Error while trying to get all the DID transactions', error);

                return res.status(404).json(commonService.returnError(network, 404, error));
            } else {
                const data = {
                    didTxes: results,
                    count: results.length
                };
                const costInUsd = 0.25;
                accountFunction
                    .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                    .then((account) => {
                        if (account.error) {
                            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                        return res.status(500).json(commonService.returnError(network, 500, error));
                    });
            }
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to get all the DID transactions: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getDIDTxFromConfirmationId = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const _id = req.params.confirmationId;
    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const result: any = conn.models.DidTx.findOne({ _id })
        .exec()
        .then((didTx) => {
            if (!didTx) {
                const error: string = 'Could not find a DID transaction in the database';
                logging.error(NAMESPACE, 'Error while trying to get a DID transaction from confirmationId', error);

                return res.status(404).json(commonService.returnError(network, 404, error));
            } else {
                const data = {
                    didTx
                };
                const costInUsd = 0.0001;
                accountFunction
                    .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                    .then((account) => {
                        if (account.error) {
                            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                        return res.status(500).json(commonService.returnError(network, 500, error));
                    });
            }
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to get a DID transaction from confirmationId: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getDIDTxStats = (req: Request, res: Response, next: NextFunction) => {
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

    const result: any = eidSidechainStats.getTxStats(network, beginDate, endDate).then((stats) => {
        if (stats.error !== null) {
            logging.error(NAMESPACE, 'Error while trying to get DID tx stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            const data = stats.data;
            let costInUsd = 0.001;
            if (dateString === 'all') {
                costInUsd = 0.1;
            }
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                .then((account) => {
                    if (account.error) {
                        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

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

    const result: any = conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name })
        .exec()
        .then((data) => {
            const costInUsd = 0.001;
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                .then((account) => {
                    if (account.error) {
                        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to get the latest block info: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

export default {
    publishDIDTx,
    getAllDIDTxes,
    getDIDTxFromConfirmationId,
    getDIDTxStats,
    getBlockInfoLatest
};
