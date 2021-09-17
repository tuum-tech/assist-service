import { NextFunction, Request, Response } from 'express';
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

    const { didRequest, memo } = req.body;
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

                accountFunction
                    .handleAPILimit(conn, authTokenDecoded, true)
                    .then((account) => {
                        if (account.error) {
                            return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        const user: IUser = account.user;
                        const didTx = new conn.models.DidTx({
                            _id: new mongoose.Types.ObjectId(),
                            did,
                            requestFrom: { username: user.username },
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
                                user.requests.premiumEndpoints.today += 1;
                                user.requests.premiumEndpoints.all += 1;
                                user.save().catch((error: any) => {
                                    logging.error(NAMESPACE, 'Error while trying to sign the transaction: ', error);

                                    return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                                });
                                return res.status(201).json(commonService.returnSuccess(network, 200, data));
                            })
                            .catch((error: any) => {
                                logging.error(NAMESPACE, 'Error while trying to save the DID tx to the database: ', error);

                                return commonService.returnError(network, 500, error);
                            });
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

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
                accountFunction
                    .handleAPILimit(conn, authTokenDecoded, true)
                    .then((account) => {
                        if (account.error) {
                            return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        const user: IUser = account.user;
                        user.requests.premiumEndpoints.today += 1;
                        user.requests.premiumEndpoints.all += 1;
                        user.save().catch((error: any) => {
                            logging.error(NAMESPACE, 'Error while trying to get all the DID transactions: ', error);

                            return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                        });
                        return res.status(200).json(commonService.returnSuccess(network, 200, data));
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

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
                accountFunction
                    .handleAPILimit(conn, authTokenDecoded, false)
                    .then((account) => {
                        if (account.error) {
                            return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        const user: IUser = account.user;
                        user.requests.freeEndpoints.today += 1;
                        user.requests.freeEndpoints.all += 1;
                        user.save().catch((error: any) => {
                            logging.error(NAMESPACE, 'Error while trying to get a DID transaction from confirmationId: ', error);

                            return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                        });
                        return res.status(200).json(commonService.returnSuccess(network, 200, data));
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

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
    const beginDate = commonFunction.getDateFromString(dateString);
    if (beginDate == null) {
        const error = 'Date can only be passed in the following format: [today|yesterday|YYYY-MM-DD]';
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
    const endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
    if (dateString === 'today' || dateString === 'yesterday') {
        beginDate.setDate(beginDate.getDate() - 1);
    } else {
        endDate.setDate(endDate.getDate() + 1);
    }

    const result: any = eidSidechainStats.getTxStats(network, beginDate, endDate).then((stats) => {
        if (stats.error !== null) {
            logging.error(NAMESPACE, 'Error while trying to get DID tx stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            const data = stats.data;
            accountFunction
                .handleAPILimit(conn, authTokenDecoded, true)
                .then((account) => {
                    if (account.error) {
                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    const user: IUser = account.user;
                    user.requests.premiumEndpoints.today += 1;
                    user.requests.premiumEndpoints.all += 1;
                    user.save().catch((error: any) => {
                        logging.error(NAMESPACE, 'Error while trying to get DID tx stats: ', error);

                        return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                    });
                    return res.status(200).json(commonService.returnSuccess(network, 200, data));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

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
            accountFunction
                .handleAPILimit(conn, authTokenDecoded, false)
                .then((account) => {
                    if (account.error) {
                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    const user: IUser = account.user;
                    user.requests.premiumEndpoints.today += 1;
                    user.requests.premiumEndpoints.all += 1;
                    user.save().catch((error: any) => {
                        logging.error(NAMESPACE, 'Error while trying to get the latest block info: ', error);

                        return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                    });
                    return res.status(200).json(commonService.returnSuccess(network, 200, data));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

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
