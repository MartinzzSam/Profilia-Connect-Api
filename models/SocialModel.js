const mongoose = require("mongoose"); // Erase if already required


// Declare the Schema of the Mongo model
var socialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  image: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});


socialSchema.post("init", (doc) => {
    if (doc.image) {
      const imageUrl = `${process.env.BASE_URL}/socials/${doc.image}`;
  
      doc.image = imageUrl;
    }
  });
  
//Export the model
module.exports = mongoose.model("Social", socialSchema);
