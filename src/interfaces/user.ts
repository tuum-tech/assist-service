import { Document } from 'mongoose';

interface IEndpointStats {
    today: number;
    all: number;
    dailyQuota: number;
}

interface IRequests {
    freeEndpoints: IEndpointStats;
    premiumEndpoints: IEndpointStats;
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
