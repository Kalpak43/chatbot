const express = require("express");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

// Configure Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS), // Path to your service account key file
});

const bucketName = "chatbot-files";
const bucket = storage.bucket(bucketName);

module.exports = { storage, bucket, bucketName };
