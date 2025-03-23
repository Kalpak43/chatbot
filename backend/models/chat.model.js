const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
});

const ChatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  messages: [MessageSchema],
  uid: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Chat", ChatSchema);
