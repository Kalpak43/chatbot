const { createResponseStream, generateTitle } = require("../../utils/ai");
const asyncHandler = require("../../utils/asyncHandler");
const Chat = require("../../models/chat.model");
const { saveToChat } = require("../../utils/chat");

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

module.exports = {
  streamResponse,
  getTitle,
};
