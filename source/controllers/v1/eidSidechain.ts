import { NextFunction, Request, Response } from 'express';
import { Base64 } from 'js-base64';
import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import eidSidechainStats from '../../functions/stats/eidSidechain';
import commonFunction from '../../functions/common';
import commonService from '../../services/v1/common';
import rpcService from '../../services/v1/eidSidechainRpc';

const NAMESPACE = 'Controller: EID Sidechain';

const createDIDTx = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;
    const username = authTokenDecoded['username'];

    let { network, didRequest, memo } = req.body;
    network = network ? network : config.blockchain.mainnet;
    let did: any = null;
    try {
        let didRequestPayload = didRequest['payload'];
        didRequestPayload = JSON.parse(Base64.decode(didRequestPayload + '='.repeat(didRequestPayload.length % 4)));
        did = didRequestPayload['id'].replace('did:elastos:', '').split('#')[0];
    } catch (error) {
        logging.error(NAMESPACE, 'Error while trying to retrieve DID from the payload: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }

    // TODO: Check if requestFrom DID is valid by resolving it

    // Select a random wallet to use
    let wallet = config.blockchain.eidSidechain.wallets.keystores[Math.floor(Math.random() * config.blockchain.eidSidechain.wallets.keystores.length)];

    // Verify whether the given payload is valid by trying to create a transaction out of it and then proceed
    // to the next step if valid
    const result: any = rpcService
        .signTx(network, wallet, JSON.stringify(didRequest))
        .then((res: any) => {
            if (res.error) {
                logging.error(NAMESPACE, 'Error while trying to sign the transaction: ', res.error);
            }
            return res.txDetails;
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
                let error = 'Error while trying to sign the transaction';
                logging.error(NAMESPACE, error);

                return res.status(500).json(commonService.returnError(network, 500, error));
            } else {
                const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

                conn.models.User.find({ username })
                    .exec()
                    .then((users) => {
                        if (users.length !== 1) {
                            return res.status(401).json(commonService.returnError(network, 401, 'Unauthorized'));
                        }
                        let user = users[0];
                        let count: number = user.requests.premiumEndpoints.today;
                        if (count >= user.requests.premiumEndpoints.dailyLimit) {
                            let error = 'The user "' + user.username + '" has reached the daily API call limit of ' + config.user.premiumEndpointsDailyLimit;
                            logging.error(NAMESPACE, 'Error while trying to create a DID transaction: ', error);

                            return res.status(401).json(commonService.returnError(network, 401, error));
                        }
                        const didTx = new conn.models.DidTx({
                            _id: new mongoose.Types.ObjectId(),
                            did,
                            requestFrom: { username },
                            didRequest,
                            memo,
                            status: config.txStatus.pending
                        });
                        didTx
                            .save()
                            .then((result: any) => {
                                const _result = JSON.parse(JSON.stringify(result));
                                _result['confirmationId'] = _result['_id'];
                                user.requests.premiumEndpoints.today += 1;
                                user.requests.premiumEndpoints.all += 1;
                                user.save();
                                let data = {
                                    didTx: _result
                                };
                                return res.status(201).json(commonService.returnSuccess(network, 200, data));
                            })
                            .catch((error: any) => {
                                logging.error(NAMESPACE, 'Error while trying to save the DID tx to the database: ', error);

                                return commonService.returnError(network, 500, error);
                            });
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, `Error while trying to validate the user '${username}': `, error);

                        return res.status(401).json(commonService.returnError(network, 401, error));
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
    const username = authTokenDecoded['username'];

    const network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    // TODO: Need to add to user free API count

    const result: any = conn.models.DidTx.find()
        .exec()
        .then((results) => {
            if (results.length === 0) {
                let error: string = 'Error while trying to get DID transactions';
                logging.error(NAMESPACE, error);

                return res.status(404).json(commonService.returnError(network, 404, error));
            } else {
                let data = {
                    didTxes: results,
                    count: results.length
                };
                return res.status(200).json(commonService.returnSuccess(network, 200, data));
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
    const username = authTokenDecoded['username'];

    const _id = req.params.confirmationId;
    const network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    // TODO: Need to add to user free API count

    const result: any = conn.models.DidTx.findOne({ _id })
        .exec()
        .then((didTx) => {
            if (!didTx) {
                let error: string = 'Error while trying to get a DID transaction from confirmationId';
                logging.error(NAMESPACE, error);

                return res.status(404).json(commonService.returnError(network, 404, error));
            } else {
                let data = {
                    didTx
                };
                return res.status(200).json(commonService.returnSuccess(network, 200, data));
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
    const username = authTokenDecoded['username'];

    const network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;

    const dateString = req.query.created ? req.query.created.toString() : 'today';
    let beginDate = commonFunction.getDateFromString(dateString);
    if (beginDate == null) {
        let error = 'Date can only be passed in the following format: [today|yesterday|YYYY-MM-DD]';
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
    let endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
    if (dateString === 'today' || dateString === 'yesterday') {
        beginDate.setDate(beginDate.getDate() - 1);
    } else {
        endDate.setDate(endDate.getDate() + 1);
    }

    // TODO: Need to add to user free API count

    eidSidechainStats.getTxStats(network, beginDate, endDate).then((stats) => {
        if (stats.error !== null) {
            logging.error(NAMESPACE, 'Error while trying to get DID tx stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            return res.status(200).json(commonService.returnSuccess(network, 200, stats.data.didTxes));
        }
    });
};

export default {
    createDIDTx,
    getAllDIDTxes,
    getDIDTxFromConfirmationId,
    getDIDTxStats
};
