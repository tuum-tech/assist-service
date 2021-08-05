import { Document } from 'mongoose';

export default interface IDidTx extends Document {
    did: string;
    requestFrom: object;
    didRequest: object;
    memo: string;
    status: string;
    blockchainTxHash: string;
    blockchainTxReceipt: object;
    extraInfo: object;
    walletUsed: string;
}
