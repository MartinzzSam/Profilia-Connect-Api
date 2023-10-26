const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/UserModel");

const phoneLoginValidator = [
  body("country_code").notEmpty().withMessage("country_code is required"),
  body("phone_number")
    .notEmpty()
    .withMessage("phone_number is required")
    .isMobilePhone()
    .withMessage("phone_number is not valid")
    .custom(async (val, { req, res }) => {
      const user = await User.findOne({ phone_number: val });
      req.body.user = user;
      req.body.login_type = "phone";
    }),
];

// Custom validator for Google login
(googleLoginValidator = check("provider_id")
  .notEmpty()
  .withMessage("provider_id is required")),
  (exports.loginValidator = [
    body("login_type").notEmpty().withMessage("login type required"),
    validatorMiddleware,
  ]);

exports.loginPhoneTypeValidator = [phoneLoginValidator, validatorMiddleware];
const validators = (req, res, next) => {
  switch (req.body.login_type) {
    case "phone":
      console.log("IM iN pHONE");
      return true;
      break; // Invoke and pass req, res
    case "google":
      return googleLoginValidator; // Invoke and pass req, res
    default:
      return new Error("dawdawdas");
  }
};

exports.signupValidator = [
  // loginTypeValidator,
  // ... other validation checks specific to signup process
];
