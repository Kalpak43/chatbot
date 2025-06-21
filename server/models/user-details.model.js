import mongoose from "mongoose"

const UserDetailsSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
        type: String,
    },
    role: {
        type: String,
    },
    extra: {
        type: String,
    },
    uid: {
        type: String,
        required: true,
    },
})

export const UserDetails = mongoose.model("UserDetails", UserDetailsSchema);
