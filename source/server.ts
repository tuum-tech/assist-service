import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logging from './config/logging';
import config from './config/config';
import cronEIDSidechain from './cron/v1/eidSidechain';
import healthCheckRoutes from './routes/v1/healthCheck';
import authRoutes from './routes/v1/user';
import eidSidechainRoutes from './routes/v1/eidSidechain';

const NAMESPACE = 'Server';
const router = express();

/** Log the request */
router.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
router.use(express.json({ limit: '32mb' }));
router.use(
    express.urlencoded({
        limit: '32mb',
        extended: true,
        parameterLimit: 1000000
    })
);

/** Rules of our API */
router.use(cors({ origin: true }));

/** Routes go here */
/** Healthcheck Routes */
router.use('/v1/healthCheck', healthCheckRoutes);
/** User authentication Routes */
router.use('/v1/users', authRoutes);
/** Elastos Mainchain Routes */
// TODO:
/** EID Sidechain Routes */
router.use('/v1/eidSidechain', eidSidechainRoutes);
/** ESC Sidechain Routes */
// TODO:

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

    let _network = req.query.network;
    if (!_network) {
        let { network } = req.body;
        _network = network ? network : config.blockchain.mainnet;
    }

    res.status(404).json({
        _status: 'ERR',
        network: _network,
        _error: {
            code: 404,
            message: error.message
        }
    });
});

router.listen(config.server.port, () => {
    logging.info(NAMESPACE, `Assist Service is running on ${config.server.hostname}:${config.server.port}`);

    cronEIDSidechain.dailyCronjob(config.blockchain.mainnet);
    cronEIDSidechain.dailyCronjob(config.blockchain.testnet);
    cronEIDSidechain.publishDIDTx(config.blockchain.mainnet);
    cronEIDSidechain.publishDIDTx(config.blockchain.testnet);
});
