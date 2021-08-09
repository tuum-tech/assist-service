import mongoose, { Schema } from 'mongoose';
import ILatestBlockchainState from '../interfaces/latestBlockchainState';

const LatestBlockchainStateSchema: Schema = new Schema(
    {
        chain: { type: String, required: true },
        network: { type: String },
        height: { type: Number },
        miner: { type: String },
        validator: {
            name: { type: String },
            rank: { type: Number },
            ownerKey: { type: String },
            nodeKey: { type: String },
            location: { type: String },
            url: { type: String },
            ip: { type: String }
        },
        numTx: { type: Number },
        block: { type: Object },
        extraInfo: { type: Object }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ILatestBlockchainState>('LatestBlockchainState', LatestBlockchainStateSchema);
