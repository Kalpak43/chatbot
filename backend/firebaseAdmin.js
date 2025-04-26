require("dotenv").config();

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
  ),
});

module.exports = admin;
