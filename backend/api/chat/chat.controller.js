const {
  createResponseStream,
  generateTitle,
  createParts,
} = require("../../utils/ai");
const asyncHandler = require("../../utils/asyncHandler");
const Chat = require("../../models/chat.model");
const chatModel = require("../../models/chat.model");
const MessagesModel = require("../../models/messages.model");
const { setupLangChain } = require("../../utils/langchain");

const streamResponse = asyncHandler(async (req, res, next) => {
  const { history, id, uid } = req.body;

  console.log(history, id, uid);

  console.log(history[0].attachments);

  if (!history) {
    const err = new Error("Invalid Chat History");
    err.status = 400;
    throw err;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const parts = await createParts(history);
  console.log("Parts:", parts);

  const { memory, streamable: aiResponseStream } = await setupLangChain(
    history,
    id
  );

  let aiResponse = "";
  for await (const chunk of aiResponseStream) {
    if (chunk) {
      aiResponse += chunk;
      res.write(`data: ${JSON.stringify({ msg: chunk })} \n\n`);
    }
  }

  await memory.saveContext(
    { input: history[history.length - 1].text },
    { output: aiResponse }
  );

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

const sync = asyncHandler(async (req, res, next) => {
  const { chats, messages, lastSynced } = req.body;

  console.log(
    "---------------------------------------------------------------------"
  );
  console.log(lastSynced);
  const newChats = await chatModel
    .find({
      $or: [
        { created_at: { $gte: lastSynced } },
        { updated_at: { $gte: lastSynced } },
      ],
    })
    .lean();

  const formattedChats = newChats.map((doc) => {
    doc.id = doc._id;
    delete doc._id;
    delete doc.__v;
    return doc;
  });

  const newMessages = await MessagesModel.find({
    $or: [
      { created_at: { $gte: lastSynced } },
      { updated_at: { $gte: lastSynced } },
    ],
  }).lean();

  const formattedMessages = newMessages.map((doc) => {
    doc.id = doc._id;
    delete doc._id;
    delete doc.__v;
    return doc;
  });

  console.log(newChats, newMessages);

  if (!chats && !messages) {
    const err = new Error("No chats and messages received");
    err.status = 400;
    throw err;
  }

  if (chats.length > 0) {
    const chatOperations = chats.map((chat) => ({
      updateOne: {
        filter: { _id: chat.id },
        update: {
          $set: {
            title: chat.title || "New Chat",
            created_at: chat.created_at,
            updated_at: chat.updated_at,
            last_message_at: chat.last_message_at,
            status: chat.status,
            lastSynced: new Date().getTime(),
          },
        },
        upsert: true,
      },
    }));

    await chatModel.bulkWrite(chatOperations);
  }

  if (messages.length > 0) {
    const messageOperations = messages.map((message) => ({
      updateOne: {
        filter: { _id: message.id },
        update: {
          $set: {
            role: message.role,
            text: message.text,
            chatId: message.chatId,
            status: message.status,
            created_at: message.created_at,
            updated_at: message.updated_at,
          },
        },
        upsert: true,
      },
    }));

    await MessagesModel.bulkWrite(messageOperations);
  }

  return res.status(200).send({
    chats: formattedChats,
    messages: formattedMessages,
    time: new Date().getTime(),
    msg: "Sync Successful",
  });
});

const syncChat = asyncHandler(async (req, res, next) => {
  const { chat } = req.body;

  const { id } = chat;

  const { uid } = req.user;

  if (!id) {
    const newChat = new chatModel({ ...chat, uid });
    await newChat.save();
    return res.status(201).send({ chat: newChat, msg: "Chat created" });
  } else {
    const updatedChat = await chatModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...chat, uid } },
      { new: true, upsert: true }
    );
    return res.status(200).send({ chat: updatedChat, msg: "Chat updated" });
  }
});

const getChats = asyncHandler(async (req, res, next) => {
  const since = req.query.since;

  if (!since) {
    return res.status(400).json({ error: 'Missing "since" query parameter' });
  }

  const { uid } = req.user;

  const chats = await chatModel
    .find({
      uid,
      $or: [{ created_at: { $gte: since } }, { updated_at: { $gte: since } }],
    })
    .lean();

  const formattedChats = chats.map((doc) => {
    doc.id = doc._id;
    delete doc._id;
    delete doc.__v;
    return doc;
  });

  return res.status(200).json({ chats: formattedChats });
});

const syncMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const { id } = message;

  const { uid } = req.user;

  if (!id) {
    const newMessage = new MessagesModel({ ...message, uid });
    await newMessage.save();
    return res
      .status(201)
      .send({ message: newMessage, msg: "Message created" });
  } else {
    const updatedMessage = await MessagesModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...message, uid } },
      { new: true, upsert: true }
    );
    return res
      .status(200)
      .send({ message: updatedMessage, msg: "Message updated" });
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const since = req.query.since;

  if (!since) {
    return res.status(400).json({ error: 'Missing "since" query parameter' });
  }

  const { uid } = req.user;
  const messages = await MessagesModel.find({
    uid,
    $or: [{ created_at: { $gte: since } }, { updated_at: { $gte: since } }],
  }).lean();

  const formattedMessages = messages.map((doc) => {
    doc.id = doc._id;
    delete doc._id;
    delete doc.__v;
    return doc;
  });

  return res.status(200).json({ messages: formattedMessages });
});

module.exports = {
  streamResponse,
  getTitle,
  sync,
  syncChat,
  getChats,
  syncMessage,
  getMessages,
};
