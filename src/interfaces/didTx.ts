import { Document } from 'mongoose';

interface IRequestFrom {
    username: string;
}

export default interface IDidTx extends Document {
    did: string;
    requestFrom: IRequestFrom;
    didRequest: object;
    memo: string;
    status: string;
    blockchainTxHash: string;
    blockchainTxReceipt: object;
    extraInfo: object;
    walletUsed: string;
}
