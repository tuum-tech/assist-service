import mongoose from 'mongoose';
import config from '../config/config';
import UserSchema from '../schemas/user';
import DidTxSchema from '../schemas/didTx';
import LatestBlockchainStateSchema from '../schemas/latestBlockchainState';

const connTestnet = mongoose.createConnection(config.mongo.testnet.url, config.mongo.options);
connTestnet.model('User', UserSchema);
connTestnet.model('DidTx', DidTxSchema);
connTestnet.model('LatestBlockchainState', LatestBlockchainStateSchema);

export default connTestnet;
