const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const uploadProfile = require("../middleware/uploadProfile");

const {
  getUsers,
  updateProfilePic,
} = require("../controllers/userController");

router.get("/", protect, getUsers);

router.put(
  "/profile",
  protect,
  uploadProfile.single("profilePic"),
  updateProfilePic
);

module.exports = router;