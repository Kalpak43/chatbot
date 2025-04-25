const asyncHandler = require("../../utils/asyncHandler");
const { bucket, bucketName } = require("../../utils/bucket");
const path = require("path");

const uploadHandler = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const sensitiveExtensions = [
    ".env",
    ".key",
    ".pem",
    ".crt",
    ".cert",
    ".json",
    ".yml",
    ".yaml",
  ];
  const ext = path.extname(req.file.originalname).toLowerCase();

  if (sensitiveExtensions.includes(ext)) {
    return res
      .status(400)
      .json({ error: "Uploading sensitive file types is not allowed" });
  }

  // Create a unique filename to prevent overwriting files
  const filename = `${Date.now()}-${req.file.originalname}`;

  // Create a new blob in the bucket and upload the file data
  const blob = bucket.file(filename);

  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobStream.on("error", (err) => {
    console.error(err);
    return res.status(500).json({ error: "Unable to upload file" });
  });

  blobStream.on("finish", async () => {
    // Make the file public
    await blob.makePublic();

    // Generate the public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    res.status(200).json({
      message: "Upload successful",
      fileUrl: publicUrl,
    });
  });

  blobStream.end(req.file.buffer);
});

module.exports = {
  uploadHandler,
};
