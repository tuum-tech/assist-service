import mongoose from 'mongoose';
import config from '../config/config';
import UserSchema from '../schemas/user';
import DidTxSchema from '../schemas/didTx';
import LatestBlockchainStateSchema from '../schemas/latestBlockchainState';

const connMainnet = mongoose.createConnection(config.mongo.mainnet.url, config.mongo.options);
connMainnet.model('User', UserSchema);
connMainnet.model('DidTx', DidTxSchema);
connMainnet.model('LatestBlockchainState', LatestBlockchainStateSchema);

export default connMainnet;
