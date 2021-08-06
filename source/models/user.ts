import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';

const UserSchema: Schema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        accountType: { type: String, required: true },
        requests: {
            freeEndpoints: {
                today: { type: Number, required: true },
                all: { type: Number, required: true },
                dailyLimit: { type: Number, required: true }
            },
            premiumEndpoints: {
                today: { type: Number, required: true },
                all: { type: Number, required: true },
                dailyLimit: { type: Number, required: true }
            }
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IUser>('User', UserSchema);
