import mongoose, { Schema } from 'mongoose';
import IEidSidechainState from '../interfaces/eidSidechainState';

const EidSidechainStateSchema: Schema = new Schema(
    {
        network: { type: String, required: true },
        height: { type: Number, required: true },
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
        block: { type: Object }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IEidSidechainState>('EidSidechainState', EidSidechainStateSchema);
