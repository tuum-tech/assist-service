import jwt from 'jsonwebtoken';
import config from '../config/config';
import logging from '../config/logging';
import commonService from '../services/v1/common';
import { Request, Response, NextFunction } from 'express';

const NAMESPACE = 'Middleware: User Auth';

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Validating token');

    let network = (): string => {
        let result = config.blockchain.mainnet;
        if (!req.query.network) {
            let { network } = req.body;
            result = network ? network : config.blockchain.mainnet;
        } else {
            result = req.query.network.toString();
        }
        return result;
    };

    let token = req.headers.authorization?.split(' ')[1];

    if (token) {
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if (error) {
                return res.status(404).json(commonService.returnError(network(), 404, error));
            } else {
                res.locals.jwt = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json(commonService.returnError(network(), 401, 'Unathorized'));
    }
};

export default extractJWT;
