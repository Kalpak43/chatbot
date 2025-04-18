const { createResponseStream, generateTitle } = require("../../utils/ai");
const asyncHandler = require("../../utils/asyncHandler");
const Chat = require("../../models/chat.model");
const { saveToChat } = require("../../utils/chat");
const chatModel = require("../../models/chat.model");
const MessagesModel = require("../../models/messages.model");

const streamResponse = asyncHandler(async (req, res, next) => {
  const { history, id, uid } = req.body;

  console.log(history, id, uid);

  if (!history) {
    const err = new Error("Invalid Chat History");
    err.status = 400;
    throw err;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const aiResponseStream = createResponseStream(history);

  let chatId = null;

  if (!id) {
    if (uid) {
      const newChat = new Chat({
        title: "New Chat",
        messages: history,
        uid: uid,
      });

      await newChat.save();
      chatId = newChat._id.toString();
    }
  } else {
    chatId = id;
  }

  res.write(`id: ${chatId} \n\n`);
  let aiResponse = "";
  for await (const chunk of aiResponseStream) {
    const cleanedChunk = chunk.text;
    aiResponse += cleanedChunk;

    if (cleanedChunk) {
      res.write(`data: ${JSON.stringify({ msg: cleanedChunk })} \n\n`);
    }
  }

  if (chatId && uid)
    await saveToChat(chatId, [
      ...history,
      {
        role: "ai",
        text: aiResponse,
      },
    ]);

  return res.end();
});

const getTitle = asyncHandler(async (req, res, next) => {
  const { history } = req.body;

  if (!history) {
    const err = new Error("Invalid Chat History");
    err.status = 400;
    throw err;
  }

  const title = await generateTitle(history);

  if (!title) {
    const err = new Error("Unable to generate a title");
    err.status = 500;
    throw err;
  }

  return res.status(200).send({
    title,
  });
});

const syncChat = asyncHandler(async (req, res, next) => {
  const { chat, messages } = req.body;

  const { id } = chat;
  const existingChat = await chatModel.findById(id);

  let lastSynced = new Date().getTime();
  if (!existingChat) {
    const newChat = new chatModel({
      _id: id,
      title: chat.title || "New Chat",
      created_at: chat.created_at,
      last_message_at: chat.last_message_at,
      status: chat.status,
      lastSynced,
    });
    await newChat.save();
  }

  if (messages && messages.length > 0) {
    const operations = messages.map((message) => ({
      updateOne: {
        filter: { _id: message.id },
        update: {
          $set: {
            role: message.role,
            text: message.text,
            chatId: id,
            status: message.status,
            created_at: message.created_at,
            updated_at: message.updated_at,
          },
        },
        upsert: true, // Create if doesn't exist, update if exists
      },
    }));

    // Use bulkWrite for efficient batch operations
    await MessagesModel.bulkWrite(operations);

    console.log(1);

    lastSynced = new Date().getTime();
    // Update chat's lastSynced timestamp
    await chatModel.findByIdAndUpdate(id, { lastSynced });
  }

  return res.status(200).send({ lastSynced });
});

const getSyncTime = asyncHandler(async (req, res, next) => {
  const { chatId } = req.body;

  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return res.status(200).send({ lastSynced: -1 });
  }

  return res
    .status(200)
    .send({ lastSynced: chat.lastSynced ? chat.lastSynced : -1 });
});

module.exports = {
  streamResponse,
  getTitle,
  syncChat,
  getSyncTime,
};
