import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import DidTx from '../../models/didTx';

const NAMESPACE = 'Controller: EID Sidechain';

const createDIDTx = (req: Request, res: Response, next: NextFunction) => {
    let { didRequest } = req.body;

    let authTokenDecoded = res.locals.jwt || { username: 'kiran' };

    const didTx = new DidTx({
        _id: new mongoose.Types.ObjectId(),
        did: config.server.token.issuer,
        requestFrom: authTokenDecoded['username'],
        didRequest,
        status: 'Pending',
        walletUsed: '0x365b70f14e10b02bef7e463eca6aa3e75ca3cdb1'
    });

    return didTx
        .save()
        .then((result) => {
            const _result = JSON.parse(JSON.stringify(result));
            _result['confirmation_id'] = _result['_id'];
            return res.status(201).json({
                _status: 'OK',
                didTx: _result
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to create a DID transaction: ', err);

            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
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

    DidTx.find({ _id })
        .exec()
        .then((results) => {
            if (results.length !== 1) {
                return res.status(404).json({
                    _status: 'ERR',
                    _error: {
                        code: 404,
                        message: 'Could not find any DID transaction with the given confirmation_id'
                    }
                });
            } else {
                return res.status(200).json({
                    _status: 'OK',
                    didTx: results[0]
                });
            }
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
