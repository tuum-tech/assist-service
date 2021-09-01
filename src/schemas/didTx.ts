import mongoose, { Schema } from 'mongoose';

const DidTxSchema: Schema = new Schema(
    {
        did: { type: String, required: true },
        requestFrom: {
            username: { type: String, required: true }
        },
        didRequest: { type: Object, required: true },
        memo: { type: String },
        status: { type: String, required: true },
        blockchainTxHash: { type: String },
        blockchainTxReceipt: { type: Object },
        extraInfo: { type: Object },
        walletUsed: { type: String }
    },
    {
        timestamps: true
    }
);

/* DidTxSchema.post<IDidTx>('save', function () {
    this.extraInfo = { a: 'b' };
}); */

export default DidTxSchema;
