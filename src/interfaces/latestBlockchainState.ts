import { Document } from 'mongoose';

interface IValidator {
    name: string;
    rank: number;
    ownerKey: string;
    nodeKey: string;
    location: string;
    url: string;
    ip: string;
}

export default interface ILatestBlockchainState extends Document {
    chain: string;
    network: string;
    height: number;
    miner: string;
    validator: IValidator;
    avgTxHourly: number;
    accountsOverOneELA: number;
    hashrate: string;
    numTx: number;
    block: object;
    extraInfo: object;
}
