import { asyncHandler } from "../../utils/async-handler.util.js";
import { setupLangChain } from "../../utils/langchain.util.js";
import { Chat } from "../../models/chat.model.js";
import { Message } from "../../models/messages.model.js";

const streamResponse = asyncHandler(async (req, res) => {
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

// const getTitle = asyncHandler(async (req, res, next) => {
//   const { history } = req.body;

//   if (!history) {
//     const err = new Error("Invalid Chat History");
//     err.status = 400;
//     throw err;
//   }

//   const title = await generateTitle(history);

//   if (!title) {
//     const err = new Error("Unable to generate a title");
//     err.status = 500;
//     throw err;
//   }

//   return res.status(200).send({
//     title,
//   });
// });

const syncChat = asyncHandler(async (req, res, next) => {
  const { chat } = req.body;

  const { id } = chat;

  const { uid } = req.user;

  if (!id) {
    const newChat = new Chat({ ...chat, uid });
    await newChat.save();
    return res.status(201).send({ chat: newChat, msg: "Chat created" });
  } else {
    const updatedChat = await Chat.findOneAndUpdate(
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

  const chats = await Chat.find({
    uid,
    $or: [{ created_at: { $gte: since } }, { updated_at: { $gte: since } }],
  }).lean();

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
    const newMessage = new Message({ ...message, uid });
    await newMessage.save();
    return res
      .status(201)
      .send({ message: newMessage, msg: "Message created" });
  } else {
    const updatedMessage = await Message.findOneAndUpdate(
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
  const messages = await Message.find({
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

export { streamResponse, syncChat, getChats, syncMessage, getMessages };
