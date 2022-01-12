import jwt from 'jsonwebtoken';
import config from '../config/config';
import logging from '../config/logging';
import commonService from '../services/v1/common';
import { Request, Response, NextFunction } from 'express';

const NAMESPACE = 'Middleware: User Auth';

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, '', 'Validating token');

    const getNetwork = (): string => {
        let result = config.blockchain.mainnet;
        if (!req.query.network) {
            const { network } = req.body;
            result = network ? network : config.blockchain.mainnet;
        } else {
            result = req.query.network.toString();
        }
        if (!config.blockchain.validNetworks.includes(result)) result = config.blockchain.mainnet;
        return result;
    };

    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        jwt.verify(token, config.server.token.secret, (error: any, decoded: any) => {
            if (error) {
                logging.error(NAMESPACE, '', 'Error while trying to verify token', error);
                return res.status(404).json(commonService.returnError(getNetwork(), 404, error));
            } else {
                res.locals.jwt = decoded;
                next();
            }
        });
    } else {
        logging.error(NAMESPACE, '', 'Error while trying to verify token', 'Unauthorized');
        return res.status(401).json(commonService.returnError(getNetwork(), 401, 'Unathorized'));
    }
};

export default extractJWT;
