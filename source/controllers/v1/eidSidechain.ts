import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import DidTx from '../../models/didTx';

const createDIDTx = (req: Request, res: Response, next: NextFunction) => {
    let { didRequest } = req.body;

    let authTokenDecoded = res.locals.jwt;

    const didTx = new DidTx({
        _id: new mongoose.Types.ObjectId(),
        did: authTokenDecoded['username'],
        requestFrom: 'Assist Service',
        didRequest,
        status: 'Pending',
        walletUsed: '0x365b70f14e10b02bef7e463eca6aa3e75ca3cdb1'
    });

    return didTx
        .save()
        .then((result) => {
            return res.status(201).json({
                _status: 'OK',
                didTx: result
            });
        })
        .catch((error) => {
            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: error.message,
                    error
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
                didtxes: results,
                count: results.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: error.message,
                    error
                }
            });
        });
};

export default {
    createDIDTx,
    getAllDIDTxes
};
