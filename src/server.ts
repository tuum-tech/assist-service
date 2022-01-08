import cors from 'cors';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import cronEIDSidechain from './cron/v1/eidSidechain';
import cronESCSidechain from './cron/v1/escSidechain';
import cronELAMainchain from './cron/v1/elaMainchain';
import healthCheckRoutes from './routes/v1/healthCheck';
import authRoutes from './routes/v1/user';
import eidSidechainRoutes from './routes/v1/eidSidechain';
import escSidechainRoutes from './routes/v1/escSidechain';
import elaMainchainRoutes from './routes/v1/elaMainchain';
import evmChainRoutes from './routes/v1/evmChain';
import commonService from './services/v1/common';
import timeout from 'connect-timeout';

const NAMESPACE = 'Server';
const router = express();

router.use(timeout('30s'));

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
router.use('/v1/elaMainchain', elaMainchainRoutes);
/** EID Sidechain Routes */
router.use('/v1/eidSidechain', eidSidechainRoutes);
/** ESC Sidechain Routes */
router.use('/v1/escSidechain', escSidechainRoutes);

/**  EVM Chain Routes */
router.use('/v1/evmChain', evmChainRoutes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

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

    res.status(404).json(commonService.returnError(getNetwork(), 404, error));
});

router.listen(config.server.port, () => {
    logging.info(NAMESPACE, `Assist Service is running on ${config.server.hostname}:${config.server.port}`);

    cronEIDSidechain.dailyCronjob(config.blockchain.mainnet);
    cronEIDSidechain.dailyCronjob(config.blockchain.testnet);

    cronEIDSidechain.setLatestBlockInfo(config.blockchain.mainnet);
    cronEIDSidechain.publishDIDTxPending(config.blockchain.mainnet);
    cronEIDSidechain.publishDIDTxProcessing(config.blockchain.mainnet);

    cronEIDSidechain.setLatestBlockInfo(config.blockchain.testnet);
    cronEIDSidechain.publishDIDTxPending(config.blockchain.testnet);
    cronEIDSidechain.publishDIDTxProcessing(config.blockchain.testnet);

    cronESCSidechain.setLatestBlockInfo(config.blockchain.mainnet);
    cronESCSidechain.setLatestBlockInfo(config.blockchain.testnet);

    cronELAMainchain.setLatestBlockInfo(config.blockchain.mainnet);
    cronELAMainchain.setLatestBlockInfo(config.blockchain.testnet);
});
