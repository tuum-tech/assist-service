import mongoose, { Schema } from 'mongoose';

const AppStatSchema: Schema = new Schema(
    {
        network: { type: String, required: true },
        walletsInUse: { type: [] }
    },
    {
        timestamps: true
    }
);

export default AppStatSchema;
