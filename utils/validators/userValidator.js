const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const ApiError = require("../apiError");
const bcrypt = require("bcryptjs");
const User = require("../../models/UserModel");
exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid categoryId format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category Required")
    .isLength({ min: 3 })
    .withMessage("Too Short")
    .isLength({ max: 10 })
    .withMessage("Too Long"),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid categoryId format"),
  validatorMiddleware,
];

exports.changePasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User ID format"),
  body("currentPassword").notEmpty().withMessage('you must enter your current password'),
  body('passwordConfirm').notEmpty().withMessage('you must enter your new password confirm'),
  body('password').notEmpty().withMessage('you must enter your new password').custom(async (val , {req}) => {

    const user = await User.findById(req.params.id);

    if(!user) {
      throw new ApiError("User not found" , 404);
    }

    const isCorrectPassword = await bcrypt.compare(req.body.currentPassword, user.password)

    if(!isCorrectPassword) {
      throw new Error("Incorrect current password")
    }
    return true;
  }),
  validatorMiddleware,
],

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid categoryId format"),
  validatorMiddleware,
];
exports.updateLoggedUserValidator = [
  body('name')
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check('email')
    .notEmpty()
    .withMessage('Email required')
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('E-mail already in user'));
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone(['ar-EG', 'ar-SA'])
    .withMessage('Invalid phone number only accepted Egy and SA Phone numbers'),

  validatorMiddleware,
];