require("dotenv").config();

const fs = require("fs");
const https = require("https");
const path = require("path");
const morgan = require("morgan");
const express = require("express");
const app = express();
const helmet = require("helmet");

const { connectToDB } = require("./db");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./api/auth/auth.router");
const {
  configureAuth,
  checkLoggedin,
} = require("./middlewares/auth/auth.middleware");

const chatRoutes = require("./api/chat/chat.router");

const cors = require("cors");

app.use(
  cors({
    origin: process.env.ALLOWED_URL,
    credentials: true,
  })
);

configureAuth(app);

app.use(express.json());
app.use(morgan("short"));

app.get("/secret", checkLoggedin, (req, res) => {
  res.status(200).send("43");
});

app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.get("/failure", (req, res) => {
  res.send("Auth failed");
});
app.get("/success", (req, res) => {
  res.send("Auth succeeded");
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.use(errorHandler);

// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public/index.html"));
// });

// const server = https.createServer(
//   {
//     key: fs.readFileSync("key.pem"),
//     cert: fs.readFileSync("cert.pem"),
//   },
//   app
// );

const PORT = process.env.PORT || 8080

async function startServer() {
  await connectToDB();

  app.listen(PORT, () => {
    console.log(`Listening to http://localhost:${PORT}`);
  });
}

startServer();
