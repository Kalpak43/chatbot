import express from "express";
import {
  getChats,
  getMessages,
  getTitle,
  streamResponse,
  syncChat,
  syncMessage,
} from "./chat.controller.js";
import { checkLoggedin } from "../../middlewares/auth.middleware.js";
import rateLimit from 'express-rate-limit';


// 30/day for authenticated users
const authenticatedLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 30,
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: { error: 'Daily request limit reached. Try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 10/day for unauthenticated users
const unauthenticatedLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  keyGenerator: (req) => req.ip,
  message: { error: 'Daily request limit reached. Try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const conditionalLimiter = (req, res, next) => {
  if (req.user) {
    return authenticatedLimiter(req, res, next);
  } else {
    return unauthenticatedLimiter(req, res, next);
  }
};

const rejectUnauthenticated = (req, res, next) => {
  if (!req.user) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }

  next()
}


const router = express.Router();

router.post("/", checkLoggedin, conditionalLimiter, streamResponse);
router.post("/generate-title", getTitle);
router.post("/sync-chat", checkLoggedin, rejectUnauthenticated, syncChat);
router.get("/get-chats", checkLoggedin, rejectUnauthenticated, getChats);
router.post("/sync-message", checkLoggedin, rejectUnauthenticated, syncMessage);
router.get("/get-messages", checkLoggedin, rejectUnauthenticated, getMessages);

export { router };
