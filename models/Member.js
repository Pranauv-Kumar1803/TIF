import mongoose from "mongoose";
const schema = mongoose.Schema;

const memberSchema = new schema({
    id: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    community: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date
    }
},{versionKey: false})

export default mongoose.model('Member',memberSchema);