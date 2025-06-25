import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "ai"],
    },
    text: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      ref: "Chat",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["done", "pending", "failed", "typing", "deleted"],
    },
    created_at: {
      type: Number,
      required: true,
    },
    updated_at: {
      type: Number,
      required: true,
    },
    uid: {
      type: String,
      required: true,
    },
    attachments: [
      {
        url: {
          type: String,
          required: false,
        },
        type: {
          type: String,
          required: false,
        },
        name: {
          type: String,
          required: false,
        },
        size: {
          type: Number,
          required: false,
        },
      },
    ],
  },
  {
    // This will ensure MongoDB adds _id field which corresponds to the id in TypeScript interface
    timestamps: false,
  }
);

export const Message = mongoose.model("Message", MessageSchema);
