import express from "express";
import { getChats, getMessages, streamResponse, syncChat, syncMessage } from "./chat.controller.js";
import { checkLoggedin } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", streamResponse);
router.post("/sync-chat", checkLoggedin, syncChat);
router.get("/get-chats", checkLoggedin, getChats);
router.post("/sync-message", checkLoggedin, syncMessage);
router.get("/get-messages", checkLoggedin, getMessages);

export { router };
