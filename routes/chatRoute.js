const express = require("express");

const {
  sendMessage,
  getUserConversations,
  deleteAllMessages,
  getChatMessages,
  uploadAttatchment,
  configureFile,
} = require("../services/ChatService");

const { pusherAuth } = require("../services/PusherService");

const { protect } = require("../services/AuthService");

const router = express.Router();

router
  .route("/sendMessage")
  .post(protect, uploadAttatchment, configureFile, sendMessage);
router.route("/conversations").get(protect, getUserConversations);
router.route("/deleteMessages").get(deleteAllMessages);
router.route("/conversations/:conversationId").get(getChatMessages);
router.route("/auth").post(protect, pusherAuth);

module.exports = router;
