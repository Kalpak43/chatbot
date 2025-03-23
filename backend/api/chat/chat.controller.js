const { createResponseStream, generateTitle } = require("../../utils/ai");
const asyncHandler = require("../../utils/asyncHandler");

const streamResponse = asyncHandler(async (req, res, next) => {
  const { history } = req.body;

  if (!history) {
    const err = new Error("Invalid Chat History");
    err.status = 400;
    throw err;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const aiResponseStream = createResponseStream(history);

  for await (const chunk of aiResponseStream) {
    const cleanedChunk = chunk.text;

    if (cleanedChunk) {
      res.write(`data: ${JSON.stringify({ msg: cleanedChunk })}\n\n`);
    }
  }

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
