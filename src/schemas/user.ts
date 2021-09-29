import { Schema } from 'mongoose';

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        did: { type: String, required: false },
        accountType: { type: String, required: true },
        balance: { type: Number, required: false },
        orderId: { type: String, required: false },
        requests: {
            totalAPICalls: { type: Number, required: true },
            freeEndpoints: {
                today: { type: Number, required: true },
                all: { type: Number, required: true },
                dailyQuota: { type: Number, required: true }
            },
            premiumEndpoints: {
                today: { type: Number, required: true },
                all: { type: Number, required: true },
                dailyQuota: { type: Number, required: true }
            }
        }
    },
    {
        timestamps: true
    }
);

export default UserSchema;
