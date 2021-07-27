import http from 'http';
import cors from 'cors';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import healthCheckRoutes from './routes/v1/healthCheck';

const NAMESPACE = 'Tuum Assist Service';
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
router.use('/v1/healthCheck', healthCheckRoutes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`));
