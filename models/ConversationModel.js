const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var conversationSchema = new mongoose.Schema({
   senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
});

//Export the model
module.exports = mongoose.model("Conversation", conversationSchema);
