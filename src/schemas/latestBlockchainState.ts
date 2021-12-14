import mongoose, { Schema } from 'mongoose';

const LatestBlockchainStateSchema: Schema = new Schema(
    {
        chain: { type: String, required: true },
        network: { type: String },
        height: { type: Number },
        currentMiner: { type: String },
        currentValidator: {
            name: { type: String },
            rank: { type: Number },
            ondutyHeight: { type: Number },
            ownerKey: { type: String },
            nodeKey: { type: String },
            location: { type: String },
            url: { type: String }
        },
        nextValidator: {
            name: { type: String },
            rank: { type: Number },
            ondutyHeight: { type: Number },
            ownerKey: { type: String },
            nodeKey: { type: String },
            location: { type: String },
            url: { type: String }
        },
        dposArbiters: { type: Object },
        dposCandidates: { type: Object },
        elaPriceUsd: { type: Number },
        avgTxHourly: { type: Number },
        accountsOverOneELA: { type: Number },
        hashrate: { type: String },
        numTx: { type: Number },
        block: { type: Object },
        extraInfo: { type: Object }
    },
    {
        timestamps: true
    }
);

export default LatestBlockchainStateSchema;
