const User = require("../models/User");
const Message = require("../models/Message");

const getUsers = async (req, res) => {
  try {

    const users = await User.find({
      _id: { $ne: req.user.id },
    }).select("-password");

    const usersWithLastMessage = await Promise.all(

      users.map(async (user) => {

        console.log("logged in user:", req.user.id);
        console.log("current user:", user._id.toString());
        const lastMessage = await Message.findOne({

          $or: [

            {
              senderId: req.user.id,
              receiverId: user._id,
            },

            {
              senderId: user._id,
              receiverId: req.user.id,
            },

          ],

        }).sort({ createdAt: -1 });
        console.log("Found message:",lastMessage);

        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: req.user.id,
          seen: false,
        });

        return {
          ...user.toObject(),

          lastMessage: lastMessage
            ? lastMessage.text || (lastMessage.file ? "📷 Photo" : "")
            : "",

          lastMessageTime: lastMessage
            ? lastMessage.createdAt
            : null,

          lastMessageSeen: lastMessage
            ? lastMessage.seen
            : false,

          lastMessageSender: lastMessage
            ? lastMessage.senderId.toString()
            : "",

          unreadCount,
        };

      })

    );

    usersWithLastMessage.sort((a, b) => {

  if (!a.lastMessageTime) return 1;

  if (!b.lastMessageTime) return -1;

  return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);

});

    console.log(usersWithLastMessage);
    res.status(200).json(usersWithLastMessage);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });

  }
};

const updateProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    user.profilePic = req.file.path.replace(/\\/g, "/");

    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });

  }
};

module.exports = {
  getUsers,
  updateProfilePic,
};