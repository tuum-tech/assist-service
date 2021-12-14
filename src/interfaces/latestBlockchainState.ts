import { Document } from 'mongoose';

interface IValidator {
    name: string;
    rank: number;
    ondutyHeight: number;
    ownerKey: string;
    nodeKey: string;
    location: string;
    url: string;
}

export default interface ILatestBlockchainState extends Document {
    chain: string;
    network: string;
    height: number;
    currentMiner: string;
    currentValidator: IValidator;
    nextValidator: IValidator;
    dposArbiters: object;
    dposCandidates: object;
    elaPriceUsd: number;
    avgTxHourly: number;
    accountsOverOneELA: number;
    hashrate: string;
    numTx: number;
    block: object;
    extraInfo: object;
}
