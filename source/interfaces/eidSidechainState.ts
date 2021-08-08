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

export default interface IEidSidechainState extends Document {
    network: string;
    height: number;
    validator: IValidator;
    numTx: number;
    block: object;
}
