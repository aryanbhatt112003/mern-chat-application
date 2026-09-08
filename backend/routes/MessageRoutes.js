const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const { sendMessage, getMessages, getUsers, markMessagesAsSeen, addReaction } = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

router.post("/send/:id", protect, upload.single("file"),sendMessage);
router.get("/users", protect, getUsers);
router.get("/:id", protect, getMessages);
router.put("/seen/:id", protect, markMessagesAsSeen);
router.put("/reaction/:messageId", protect, addReaction);


module.exports = router;
