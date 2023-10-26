const express = require("express");

const {
  changePasswordValidator, updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  updateUser,
  deleteUser,
  addSocial,
  uploadUserProfile,
  resizeImage,
  authUser,
  addUserSocial,
  changePassword,
  getUserProfile,
  uploadUserCover,
} = require("../services/UserService");

const { protect } = require("../services/AuthService");

const router = express.Router();

// router.route("/").get(getUsers).post(uploadUserImage, resizeImage, createUser);
router.route("/profile").get(protect ,  getUserProfile);
router.route("/:id").get(getUserById).put(updateUserById).delete(deleteUser);
router.route("/user-auth/:id").post(getUserById , authUser)
router.route("/update").post(protect, uploadUserProfile , resizeImage, updateUser);
router.route("/add_social").post(protect, addSocial);
router.route("/addSocial").post(protect, updateLoggedUserValidator, uploadUserProfile, resizeImage, addUserSocial);

router
  .route("/changePassword/:id")
  .put(changePasswordValidator, changePassword);

module.exports = router;
