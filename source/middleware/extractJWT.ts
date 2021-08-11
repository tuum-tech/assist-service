import jwt from 'jsonwebtoken';
import config from '../config/config';
import logging from '../config/logging';
import { Request, Response, NextFunction } from 'express';

const NAMESPACE = 'Middleware: User Auth';

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Validating token');

    let _network = req.query.network;
    if (!_network) {
        let { network } = req.body;
        _network = network ? network : config.blockchain.mainnet;
    }

    let token = req.headers.authorization?.split(' ')[1];

    if (token) {
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if (error) {
                return res.status(404).json({
                    _status: 'ERR',
                    network: _network,
                    _error: {
                        code: 404,
                        message: error
                    }
                });
            } else {
                res.locals.jwt = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({
            _status: 'ERR',
            _error: {
                code: 401,
                message: 'Unauthorized'
            }
        });
    }
};

export default extractJWT;
