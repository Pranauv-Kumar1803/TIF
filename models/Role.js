import mongoose from "mongoose";
const schema = mongoose.Schema;

const roleSchema = new schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
},{versionKey: false})

export default mongoose.model('Role',roleSchema);