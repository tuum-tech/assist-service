import { Document } from 'mongoose';

export default interface IDidTx extends Document {
    did: string;
    requestFrom: object;
    didRequest: object;
    memo: string;
    status: string;
    blockchainTxId: string;
    blockchainTx: object;
    extraInfo: object;
    walletUsed: string;
}
