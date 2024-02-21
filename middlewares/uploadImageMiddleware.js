const multer = require("multer");
const ApiError = require("../utils/apiError");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

var authorizedMimeTypes = ["jpg", "jpeg", "png", "pdf", "mp3"];
const multerOptions = () => {
  const multerStorage = multer.memoryStorage();
  const multerFilter = async function (req, file, cb) {
    if (validateImage(ext)) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images allowed", 400), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

const multerOptionsFiles = () => {
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (file) {
        console.log(file.filename)
        if (path.extname(file) in authorizedMimeTypes) {
          cb(null, "uploads/chat-attachments");
        } else {
          cb(
            new ApiError("You Not Allowed To Upload This File Type :)", 400),
            false
          );
        }
      }
    },
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      const filename = `attatchment-${uuidv4()}-${Date.now()}.${ext}`;
      req.body.attachment = filename;
      console.log(filename);
      cb(null, filename);
    },
  });

  const multerFilter = function (req, file, cb) {
    console.log("req from filter" + req.body.name);
    cb(null, true);
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload;
};

function validateImage(extension) {
  switch (extension) {
    case ".jpg":
      return true;
    case ".jpeg":
      return true;
    case ".png":
      return true;
    default:
      return false;
  }
}

exports.uploadFile = (fieldName) => multerOptionsFiles().single(fieldName);

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixOfImages = (arrayOfFields) =>
  multerOptions().fields(arrayOfFields);
