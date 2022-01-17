import mongoose from 'mongoose';
import config from '../config/config';
import logging from '../config/logging';
import UserSchema from '../schemas/user';
import DidTxSchema from '../schemas/didTx';
import LatestBlockchainStateSchema from '../schemas/latestBlockchainState';
import AppStatSchema from '../schemas/appStat';

const NAMESPACE = 'Connections: Testnet';

logging.info(NAMESPACE, '', `Connecting to mongodb testnet at ${config.mongo.testnet.url}`);

const conn = mongoose.createConnection(config.mongo.testnet.url, config.mongo.options);
const connTestnet = {
    User: conn.model('User', UserSchema),
    DidTx: conn.model('DidTx', DidTxSchema),
    LatestBlockchainState: conn.model('LatestBlockchainState', LatestBlockchainStateSchema),
    AppStat: conn.model('AppStat', AppStatSchema)
};

export default connTestnet;
