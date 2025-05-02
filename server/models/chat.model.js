import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: {
      type: String,
      required: true,
    },
    created_at: {
      type: Number,
      required: true,
    },
    updated_at: {
      type: Number,
      required: true,
    },
    last_message_at: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["done", "pending", "failed", "typing", "deleted"],
    },
    lastSynced: {
      type: Number,
      default: null,
    },
    uid: {
      type: String,
      required: true,
    },
  },
  {
    // This will ensure MongoDB adds _id field which corresponds to the id in TypeScript interface
    timestamps: false,
    _id: false,
  }
);

// ChatSchema.index({ id: 1 }, { unique: true });
// ChatSchema.index({ status: 1 });
// ChatSchema.index({ lastSynced: 1 });

export const Chat = mongoose.model("Chat", ChatSchema);
