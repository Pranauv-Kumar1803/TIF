import mongoose from "mongoose";
const schema = mongoose.Schema;

const communitySchema = new schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    owner: {
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

export default mongoose.model('Community',communitySchema);