const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const userRoute = require("./routes/userRoute");
const userService = require("./services/UserService");
const authRoute = require("./routes/authRoute");
const socialRoute = require("./routes/socialRoute");
const chatRoute = require("./routes/chatRoute");
const cors = require("cors");
var multer = require('multer');
var forms = multer();
dotenv.config({ path: "config.env" });

// Connect To Database

const dbConnection = require("./config/database");
const { default: mongoose, mongo } = require("mongoose");
const expressAsyncHandler = require("express-async-handler");

dbConnection();

// Express App
const app = express();


// pusher.trigger("my-channel", "my-event", {
//   message: "hello world",
// });



// Middlewares
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// app.use(multer().array())
// app.use(multer({ 
//   dest: './uploads/',
//   rename: function (fieldname, filename) {
//       return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
//   },
//   onFileUploadStart: function (file) {
//       console.log(file.fieldname + ' is starting ...')
//   },
//   onFileUploadData: function (file, data) {
//       console.log(data.length + ' of ' + file.fieldname + ' arrived')
//   },
//   onFileUploadComplete: function (file) {
//       console.log(file.fieldname + ' uploaded to  ' + file.path)
//   }
// }));

// app.use(express.text())

// app.use(bodyParser.raw());
// app.use(forms.any()); 
// app.use(bodyParser.urlencoded({ extended: false }));

// app.use(bodyParser.json()); 
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true })) //tried both, true and false app.use(bodyParser.json())

// app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

// app.use(bodyParser.raw({ type: 'text/xml' }));

app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === process.env.DEVELOPMENT) {
  app.use(morgan("dev"));
}


// Mount Routes

app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/social", socialRoute);
app.use("/api/v1/chat" , chatRoute)





app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route : ${req.originalUrl}`, 400));
});

app.use(globalError);

const server = app.listen(process.env.PORT, () => {
  console.log(`App running on ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
