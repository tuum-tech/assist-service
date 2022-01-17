import { Document } from 'mongoose';

export default interface IAppStat extends Document {
    network: string;
    walletsInUse: string[];
}
