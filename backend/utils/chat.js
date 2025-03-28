const Chat = require("../models/chat.model");

const saveToChat = async (id, history) => {
  const updateChat = await Chat.findByIdAndUpdate(
    id,
    { $set: { messages: history } }, // Update the messages array
    { new: true, runValidators: true } // Return the updated document and run schema validators
  );

  // If no chat found, throw an error
  if (!updateChat) {
    throw new Error(`Chat with ID ${id} not found`);
  }

  return true;
};

module.exports = { saveToChat };
