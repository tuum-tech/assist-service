import { Document } from 'mongoose';

interface IEndpointStats {
    today: number;
    all: number;
    dailyLimit: number;
}

interface IRequests {
    freeEndpoints: IEndpointStats;
    premiumEndpoints: IEndpointStats;
}

export default interface IUser extends Document {
    username: string;
    password: string;
    accountType: string;
    requests: IRequests;
}
