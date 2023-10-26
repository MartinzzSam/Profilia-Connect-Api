const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const ConversationModel = require("../models/ConversationModel");
const UserModel = require("../models/UserModel");
const MessageModel = require("../models/MessageModel");
const { pusher } = require("../services/PusherService");
const {
  uploadFile,
  uploadSingleImage,
} = require("../middlewares/uploadImageMiddleware");
const fs = require("fs").promises;

exports.uploadAttatchment = uploadFile("attachment");

exports.configureFile = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const ext = req.file.mimetype.split("/")[1];
    if (ext == "png" || ext == "jpg" || ext == "jpeg") {
      const filename = `attachment-${uuidv4()}-${Date.now()}.jpeg`;
      await sharp(req.file.path)
        .resize(150, 150)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/chat-attachments/${filename}`);

      fs.unlink(req.file.path);

      req.body.attachment = filename;
    }
  }
  next();
});

exports.sendMessage = asyncHandler(async (req, res, next) => {
  try {
    const senderId = req.id;
    const receiverId = req.body.userId;
    const message = req.body.message;
    const attachment = req.body.attachment;

    console.log(
      `Sender Id: ${senderId}, Receiver Id: ${receiverId}, Message: ${message}, Attachment: ${attachment}`
    );

    // Find or create a conversation between sender and receiver
    const existingConversation = await ConversationModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    let conversationId;

    if (existingConversation) {
      conversationId = existingConversation._id;
    } else {
      const newConversation = new ConversationModel({
        senderId,
        receiverId,
      });
      await newConversation.save();
      conversationId = newConversation._id;
    }

    // Create and save the new message
    const initMessage = new MessageModel({
      conversation: conversationId,
      senderId,
      message,
      attachment,
    });

    const newMessage  = await initMessage.save();

    const sanitizedMessage = {
      senderId: newMessage.senderId,
      message: newMessage.message,
      messageType: newMessage.messageType,
    };

    if (newMessage.attachment) {
      sanitizedMessage.attachment = `${process.env.BASE_URL}/chat-attachments/${initMessage.attachment}`;
    }

    pusher.trigger(`private-conversation-${conversationId}`, "message-event", {
      message: sanitizedMessage,
    });

    return res.status(200).json({ data: sanitizedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while sending the message." });
  }
});

// exports.sendMessage = asyncHandler(async (req, res, next) => {
//   try {
//     const senderId = req.id;
//     const receiverId = req.body.userId;
//     const message = req.body.message;
//     const attatchment = req.body.attatchment;

//     console.log(
//       "Sender Id" +
//         senderId +
//         " Receiver Id" +
//         receiverId +
//         " Message" +
//         message +
//         " Attatchments " +
//         attatchment
//     );
//     // Check if a conversation already exists between sender and receiver
//     const existingConversation = await ConversationModel.findOne({
//       $or: [
//         { senderId, receiverId },
//         { senderId: receiverId, receiverId: senderId },
//       ],
//     });

//     if (existingConversation) {
//       console.log("Conversation Id" + existingConversation._id);
//       // Add your message sending logic here
//       const newMessage = new MessageModel({
//         conversation: existingConversation._id,
//         senderId: senderId,
//         message: message,
//         attatchment: attatchment,
//       });

//       await newMessage.save();

//       const sanitizedMessage = {
//         senderId: newMessage.senderId,
//         message: newMessage.message,
//       };

//      if (newMessage.attatchment) {
//         sanitizedMessage.attatchment = `${process.env.BASE_URL}/chat-attatchments/${newMessage.attatchment}`;
//       }

//       pusher.trigger(
//         "private-conversation-" + existingConversation._id,
//         "message-event",
//         { message: sanitizedMessage }
//       );

//       return res.status(200).json({ data: sanitizedMessage });
//     } else {
//       // Conversation doesn't exist, create a new conversation
//       const newConversation = new ConversationModel({
//         senderId: senderId,
//         receiverId: receiverId,
//       });
//       await newConversation.save();

//       console.log("Conversation Id" + newConversation._id);
//       // Add your message sending logic here
//       const newMessage = new MessageModel({
//         conversation: newConversation._id,
//         senderId: senderId,
//         message: message,
//         attatchment: attatchment,
//       });

//       await newMessage.save();

//       const sanitizedMessage = {
//         senderId: newMessage.senderId,
//         message: newMessage.message,
//       };

//      if (newMessage.attatchment) {
//         sanitizedMessage.attatchment = `${process.env.BASE_URL}/chat-attatchments/${newMessage.attatchment}`;
//       }
//       pusher.trigger(
//         "private-conversation-" + existingConversation._id,
//         "message-event",
//         { message: sanitizedMessage }
//       );
//       return res
//         .status(200)
//         .json({ data: sanitizedMessage});
//     }
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res
//       .status(500)
//       .json({ error: "An error occurred while sending the message." });
//   }
// });

exports.getUserConversations = asyncHandler(async (req, res, next) => {
  const userId = req.id;
  const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters
  const limit = parseInt(req.query.limit) || 10; // Get the limit from the query parameters

  // Calculate the skip value to skip the appropriate number of conversations
  const skip = (page - 1) * limit;

  // Find conversations where the user is a participant with pagination
  const userConversations = await ConversationModel.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .sort({ updatedAt: -1 }) // Sort by updatedAt in descending order
    .skip(skip)
    .limit(limit);

  // Populate messages within each conversation
  const populatedConversations = await Promise.all(
    userConversations.map(async (conversation) => {
      const otherUserId =
        conversation.senderId === userId
          ? conversation.receiverId
          : conversation.senderId;
      const otherUser = await UserModel.findById(otherUserId);
      const messages = await MessageModel.find({
        conversation: conversation._id,
      })
        .sort({ timestamp: -1 })
        .limit(1); // Get the latest message

      return {
        _id: conversation._id,
        participants: conversation.participants,
        user: otherUser,
        lastMessage: messages.length > 0 ? messages[0] : null,
      };
    })
  );

  return res.status(200).json({ data: populatedConversations });
});

exports.deleteAllMessages = asyncHandler(async (req, res, nexty) => {
  try {
    await MessageModel.deleteMany({}); // Delete all documents in the collection
    return res
      .status(200)
      .json({ message: "All documents deleted from the collection." });
  } catch (error) {
    console.error("Error deleting documents:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting documents." });
  }
});
exports.getChatMessages = asyncHandler(async (req, res, next) => {
  const conversationId = req.params.conversationId;
  const page = parseInt(req.query.page) || 1; // Default page 1
  const limit = parseInt(req.query.limit) || 20; // Default limit 10

  // Verify if the conversation exists
  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  // Count total messages for pagination
  const totalMessages = await MessageModel.countDocuments({
    conversation: conversationId,
  });

  // Retrieve paginated messages for the conversation
  const messages = await MessageModel.find({ conversation: conversationId })
    .sort({ timestamp: -1 }) // Sort by timestamp in descending order
    .skip((page - 1) * limit)
    .limit(limit);

  const sanitizedMessages = messages.map((message) => {
    const { conversation, ...sanitizedMessage } = message.toObject();
    return sanitizedMessage;
  });

  return res.status(200).json({
    data: sanitizedMessages,
    currentPage: page,
    totalPages: Math.ceil(totalMessages / limit),
  });
});
