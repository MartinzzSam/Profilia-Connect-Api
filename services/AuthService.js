const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const { signupValidator } = require("../utils/validators/authValidator");

const generateToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const user = await User.create({
    country_code: req.body.country_code,
    phone_number: req.body.phone_number,
    login_type: req.body.login_type,
  });
  // 2- Generate token

  const token = generateToken(user._id);

  res.status(201).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  //  1) check email and password

  // 2) check if user exists & check password is correc

  if (!req.body.user) {
    console.log("Signing Up");
    return this.signup(req, res, next);
  } else {
    // 3) generate token
    const token = generateToken(req.body.user._id);

    // 4) send response to client side
    res.status(200).json({ data: req.body.user, token });
  }
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4) Check if user change his password after token created
  // if (currentUser.passwordChangedAt) {
  //   const passChangedTimestamp = parseInt(
  //     currentUser.passwordChangedAt.getTime() / 1000,
  //     10
  //   );
  //   // Password changed after token created (Error)
  //   if (passChangedTimestamp > decoded.iat) {
  //     return next(
  //       new ApiError(
  //         'User recently changed his password. please login again..',
  //         401
  //       )
  //     );
  //   }
  // }

  req.id = currentUser.id;

  console.log("User Id" + req.id)
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler((req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });
