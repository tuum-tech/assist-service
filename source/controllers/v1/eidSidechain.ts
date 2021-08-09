import { NextFunction, Request, Response } from 'express';
import { Base64 } from 'js-base64';
import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import DidTx from '../../models/didTx';
import User from '../../models/user';

const NAMESPACE = 'Controller: EID Sidechain';

const createDIDTx = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt || { username: config.user.defaultUsername };
    const username = authTokenDecoded['username'];

    let { didRequest, memo } = req.body;
    let did: any = null;
    try {
        let didRequestPayload = didRequest['payload'];
        didRequestPayload = JSON.parse(Base64.decode(didRequestPayload + '='.repeat(didRequestPayload.length % 4)));
        did = didRequestPayload['id'].replace('did:elastos:', '').split('#')[0];
    } catch (err) {
        logging.error(NAMESPACE, 'Error while trying to retrieve DID from the payload: ', err);
        return res.status(500).json({
            _status: 'ERR',
            _error: {
                code: 500,
                message: err
            }
        });
    }

    // TODO: Check if requestFrom DID is valid by resolving it

    // TODO: Verify whether the given payload is valid by trying to create a transaction out of it

    // Check the number of requests made by the caller DID
    User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({
                    _status: 'ERR',
                    _error: {
                        code: 401,
                        message: 'Unauthorized'
                    }
                });
            }
            let user = users[0];
            let count: number = user.requests.premiumEndpoints.today;
            if (count >= config.user.premiumEndpointsDailyLimit) {
                let err = 'The user "' + user.username + '" has reached the daily API call limit of ' + config.user.premiumEndpointsDailyLimit;
                logging.error(NAMESPACE, 'Error while trying to create a DID transaction: ', err);

                // TODO Remove this comment when we have a cronjob that resets the daily limit
                /* return res.status(401).json({
                    _status: 'ERR',
                    _error: {
                        code: 401,
                        message: err
                    }
                }); */
            }
            const didTx = new DidTx({
                _id: new mongoose.Types.ObjectId(),
                did,
                requestFrom: { username },
                didRequest,
                memo,
                status: 'Pending'
            });
            didTx
                .save()
                .then((result) => {
                    const _result = JSON.parse(JSON.stringify(result));
                    _result['confirmation_id'] = _result['_id'];
                    user.requests.premiumEndpoints.today += 1;
                    user.requests.premiumEndpoints.all += 1;
                    user.save();
                    return res.status(201).json({
                        _status: 'OK',
                        didTx: _result
                    });
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to save the DID tx to the database: ', err);

                    return res.status(500).json({
                        _status: 'ERR',
                        _error: {
                            code: 500,
                            message: err
                        }
                    });
                });
        })
        .catch((err) => {
            logging.error(NAMESPACE, `Error while trying to validate the user '${username}': `, err);

            return res.status(401).json({
                _status: 'ERR',
                _error: {
                    code: 401,
                    message: err
                }
            });
        });
};

const getAllDIDTxes = (req: Request, res: Response, next: NextFunction) => {
    DidTx.find()
        .exec()
        .then((results) => {
            return res.status(200).json({
                _status: 'OK',
                didTxes: results,
                count: results.length
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to get all the DID transactions: ', err);

            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            });
        });
};

const getDIDTxFromConfirmationId = (req: Request, res: Response, next: NextFunction) => {
    const _id = req.params.confirmation_id;

    DidTx.findOne({ _id })
        .exec()
        .then((didTx) => {
            return res.status(200).json({
                _status: 'OK',
                didTx
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to get a DID transaction from confirmation_id: ', err);

            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            });
        });
};

export default {
    createDIDTx,
    getAllDIDTxes,
    getDIDTxFromConfirmationId
};
