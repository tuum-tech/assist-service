import { Document } from 'mongoose';

interface IRequests {
    today: number;
    all: number;
    exhaustedQuota: number;
    totalQuota: number;
}

export default interface IUser extends Document {
    username: string;
    password: string;
    did: string;
    accountType: string;
    orderId: string;
    balance: number;
    requests: IRequests;
}
