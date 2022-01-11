import mongoose from 'mongoose';
import config from '../config/config';
import logging from '../config/logging';
import UserSchema from '../schemas/user';
import DidTxSchema from '../schemas/didTx';
import LatestBlockchainStateSchema from '../schemas/latestBlockchainState';

const NAMESPACE = 'Connections: Mainnet';

logging.info(NAMESPACE, `Connecting to mongodb mainnet at ${config.mongo.mainnet.url}`);

const conn = mongoose.createConnection(config.mongo.mainnet.url, config.mongo.options);
const connMainnet = {
    User: conn.model('User', UserSchema),
    DidTx: conn.model('DidTx', DidTxSchema),
    LatestBlockchainState: conn.model('LatestBlockchainState', LatestBlockchainStateSchema)
};

export default connMainnet;
