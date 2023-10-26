const express = require("express");



const {
 getSocialById,
 getSocials,
 createSocial,
 deleteSocial,
 resizeImage,
 uploadSocialImage
} = require("../services/SocialService");

const { protect } = require("../services/AuthService");

const router = express.Router();

//TODO: add validation
router.route("/").get(getSocials).post(uploadSocialImage, resizeImage, createSocial);
// router.route("/:id").get(getUserById).put(updateUserById).delete(deleteUser);
// router.route("/update").post(protect, uploadUserImage, resizeImage, updateUser);


module.exports = router;
