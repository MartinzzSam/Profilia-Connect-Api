const Social = require("../models/SocialModel");
const factory = require("../services/handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");

exports.uploadSocialImage = uploadSingleImage("image");

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const ext = req.file.mimetype.split("/")[1];
    const filename = `socials-${uuidv4()}-${Date.now()}.${ext}`;
    await sharp(req.file.buffer)
      .resize(150, 150)
      .toFormat("png")
      .toFile(`uploads/socials/${filename}`);
    req.body.image = filename;
  }

  next();
});

exports.getSocials = factory.getAll(Social);

// @desc    Get specific user by id
// @route   GET /api/v1/social/:id
// @access  Private
exports.getSocialById = factory.getOne(Social);

// @desc    Create user
// @route   POST  /api/v1/social
// @access  Private
exports.createSocial = factory.createOne(Social);

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteSocial = factory.deleteOne(Social);
