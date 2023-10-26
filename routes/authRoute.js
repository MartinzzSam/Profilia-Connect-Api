const express = require("express");

const {
  loginPhoneTypeValidator
} = require("../utils/validators/authValidator");

const {
  login
} = require("../services/AuthService");

const router = express.Router();

router.route("/signup/phone").post(loginPhoneTypeValidator, login);
// router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

// router.route("/changePassword/:id").put(changePasswordValidator , changePassword);

module.exports = router;
