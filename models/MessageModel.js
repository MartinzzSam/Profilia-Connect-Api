const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation", // This should match the name of your Conversation model
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  messageType: {
    type: Number,
    enum: [2, 3, 4  , 1],
    default: 1,
  },
  attachment: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.post("init", (doc) => {
  if (doc.attachment) {
    const attatchmentUrl = `${process.env.BASE_URL}/chat-attatchments/${doc.attatchment}`;

    doc.attachment = attatchmentUrl;
  }
});
messageSchema.pre("save", function (next) {
  if (this.attachment) {
    const ext = this.attachment.split(".")[1];
    console.log("attachment - " + ext);
    switch (ext) {
      case "jpeg":
        this.messageType = 2;
        break;
      case "pdf":
        this.messageType = 3;
        break;
      case "mp3":
        this.messageType = 4;
        break;
      default:
        this.messageType = 1;
        break;
    }
  }
  next();
});

const MessageModel = mongoose.model("Message", messageSchema);

module.exports = MessageModel;
