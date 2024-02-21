const factory = require("./handlersFactory");
const User = require("../models/UserModel");
const Social = require("../models/SocialModel");
const Pusher = require("pusher");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const {
  uploadSingleImage,
  uploadMixOfImages,
} = require("../middlewares/uploadImageMiddleware");
const ApiError = require("../utils/apiError");

exports.uploadUserProfile = uploadMixOfImages([
  {
    name: "profileImage",
    maxCount: 1,
  },
  {
    name: "profileCover",
    maxCount: 1,
  },
]);
// uploadMixOfImages("profileImage");
// exports.uploadUserCover = uploadSingleImage("profileCover");
exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (req.files.profileImage) {
    const imageCoverFileName = `users-${uuidv4()}-${Date.now()}-profileImage.jpeg`;

    await sharp(req.files.profileImage[0].buffer)
      .resize(300, 300)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${imageCoverFileName}`);

    req.body.profileImage = imageCoverFileName;
  }
  if (req.files.profileCover) {
    const imageCoverFileName = `users-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.profileCover[0].buffer)
      .resize(1920, 1080)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${imageCoverFileName}`);

    req.body.profileCover = imageCoverFileName;
  }
  // if (req.files) {
  //   if (req.files.fieldname == "profileImage") {
  //     const ext = req.file.mimetype.split("/")[1];
  //     const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  //     await sharp(req.file.buffer)
  //       .resize(720, 720)
  //       .toFormat("jpeg")
  //       .jpeg({ quality: 90 })
  //       .toFile(`uploads/users/${filename}`);
  //     req.body.profileImage = filename;
  //   }
  //   if (req.files.fieldname == "profileCover") {
  //     const imageCoverFileName = `user-${uuidv4()}-${Date.now()}-cover.jpeg`;

  //     await sharp(req.file.profileCover.buffer)
  //       .resize(1280, 720)
  //       .toFormat("jpeg")
  //       .jpeg({ quality: 90 })
  //       .toFile(`uploads/users/${imageCoverFileName}`);

  //     req.body.profileCover = imageCoverFileName;
  //   }
  // }

  next();
});
// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private

// Build query
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUserById = factory.getOne(User);

exports.getUserProfile = factory.getOneProtected(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private
exports.createUser = factory.createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUserById = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  console.log("Request " + req.body.name);
  const document = await User.findByIdAndUpdate(
    req.id,
    {
      name: req.body.name,
      email: req.body.email,
      about_me: req.body.about_me,
      profileCover: req.body.profileCover,
      profileImage: req.body.profileImage,
    },
    {
      new: true,
    }
  );
  res.status(200).json({ data: document });
});

exports.addSocial = asyncHandler(async (req, res, next) => {
  console.log("Social " + req.body.userUrl);
  console.log("Social " + req.body.social);

  document = await User.findById(req.id);

  if (document.socials.length >= 8) {
    console.log("Rorsawdda;kl");
    return res.status(403).json(new ApiError("you reached the max size", 403));
  } else {
    newDoc = await document.updateOne({
      $addToSet: {
        socials: { social: req.body.social, userUrl: req.body.userUrl },
      },
    });

    socials = await Social.findById(req.body.social);

    res.status(200).json({
      data: {
        socials: { social: socials, userUrl: req.body.userUrl },
      },
    });
  }
});

exports.authUser = asyncHandler(async (req, res) => {
  const pusher = new Pusher({
    appId: "1655596",
    key: "4e0582fefc1d23fbe3f1",
    secret: "afa81a67207273ff2092",
    cluster: "eu",
    useTLS: true,
  });
  const socketId = req.body.socket_id;
  console.log("User Data" + res.data);

  const authResponse = pusher.authenticateUser("159917.447571", res.data);
  res.send(authResponse);
});

// exports.addUserSocial = asyncHandler(async (req, res, next) => {
//   const { socials } = req.body;

//   // Validate the input data (assuming 'socials' is an array of social media accounts)
//   if (!Array.isArray(socials) || socials.length === 0) {
//     return next(new ApiError("Invalid socials data", 400));
//   }

//   const maxSocialsAllowed = 2;

//   // Use findOneAndUpdate to atomically update the user and check the array length
//   const updatedUser = await User.findOneAndUpdate(
//     { _id: req.id, $expr: { $lt: [{ $size: "$socials" }, maxSocialsAllowed] } },
//     { $push: { socials: { $each: socials, $slice: maxSocialsAllowed } } },
//     { new: true, runValidators: true }
//   );

//   if (!updatedUser) {
//     return next(new ApiError("You have reached the social limit", 403));
//   }

//   res.status(200).json({ data: updatedUser.socials });
//   // console.log(req.id);
//   // const user = await User.findByIdAndUpdate(
//   //   req.id,
//   //   {
//   //     $push : { socials : req.body.socials }
//   //   },
//   //   { runValidators: true, new: true }
//   // );

//   // if (!user) {
//   //   return next(new ApiError(`No document for this id ${req.id}`, 404));
//   // }

//   // if (user.socials.length >= 8) {
//   //   return next(new ApiError(`you have reached social limit`, 403));
//   // }

//   // const document = await user.findOneAndUpdate(
//   //   { $push: { socials: req.body.socials } },
//   //   { runValidators: true, new: true }
//   // );

//   // res.status(200).json({ data: user });
// });

exports.addUserSocial = asyncHandler(async (req, res, next) => {
  const { socials } = req.body;

  // Validate the input data (assuming 'socials' is an array of social media accounts)
  // if (!Array.isArray(socials) || socials.length === 0) {
  //   return next(new ApiError('Invalid socials data', 400));
  // }
  const user = await User.findById(req.id);

  if (!user) {
    return next(new ApiError(`No document for this id ${req.id}`, 404));
  }

  // Ensure the 'socials' field is defined and is an array
  if (!Array.isArray(user.socials)) {
    user.socials = [];
  }

  // // Check if the array length is less than 'maxSocialsAllowed'
  // if (user.socials.length >= maxSocialsAllowed) {
  //   return next(new ApiError('You have reached the social limit', 403));
  // }

  // // Calculate the number of social media accounts that can be added
  // const remainingSocialSlots = maxSocialsAllowed - user.socials.length;
  // const socialsToAdd = socials.slice(0, remainingSocialSlots);

  // Add the new social media accounts to the user's profile
  user.socials.push(...socials);
  await user.save();

  res.status(200).json({ data: user });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = factory.deleteOne(User);
