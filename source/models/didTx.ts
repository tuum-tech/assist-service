import mongoose, { Schema } from 'mongoose';
import IDidTx from '../interfaces/didTx';

const DidTxSchema: Schema = new Schema(
    {
        did: { type: String, required: true },
        requestFrom: { type: Object, required: true },
        didRequest: { type: Object, required: true },
        memo: { type: String },
        status: { type: String, required: true },
        blockchainTxId: { type: String },
        blockchainTx: { type: Object },
        extraInfo: { type: Object },
        walletUsed: { type: String, required: true }
    },
    {
        timestamps: true
    }
);

/* DidTxSchema.post<IDidTx>('save', function () {
    this.extraInfo = { a: 'b' };
}); */

export default mongoose.model<IDidTx>('DidTx', DidTxSchema);
