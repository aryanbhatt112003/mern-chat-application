const Conversation =  require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const {getIO, userSocketMap} = require("../socket");

const sendMessage = async (req, res) => {
  try {
    const { message, replyTo } = req.body;
    const file = req.file;

    const receiverId = req.params.id;
    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });

      await conversation.save();
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: message || "",
      file: file ? file.path.replace(/\\/g, "/") : "",
      fileType: file ? file.mimetype : "",
      replyTo: replyTo || null,
    });

    await newMessage.save();

    conversation.messages.push(newMessage._id);
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate({
        path: "replyTo",
        populate: {
          path: "senderId",
          select: "fullName profilePic",
        },
      });

    const receiverSocketId = userSocketMap[receiverId];
    const io = getIO();

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    const conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    }).populate({
      path: "messages",
      populate: {
        path: "replyTo",
        populate:{
          path: "senderId",
          select: "fullName profilePic",
        },
      },
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getUsers = async(req, res)=>{
  try{
    const loggedInUserId = req.user.id;

    const users = await User.find({
      _id:{
        $ne: loggedInUserId,
      },
    });
    res.status(200).json(users);
  }catch(error){
  console.log(error);

  res.status(500).json({
    message:"Internal Server Error",
  });
  }
};

const markMessagesAsSeen = async (req, res) => {
  try {
    const senderId = req.params.id;
    const receiverId = req.user.id;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        seen: false,
      },
      {
        seen: true,
      }
    );

    const updated = await Message.find({
      senderId,
      receiverId,
    });

    console.log(updated);

    const senderSocketId = userSocketMap[senderId];

    console.log("Sender Socket:", senderSocketId);

    if (senderSocketId) {
      console.log("sendng messagesSeen event");
      getIO().to(senderSocketId).emit("messagesSeen", {
        receiverId,
      });
    }

    res.status(200).json({
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const addReaction = async (req, res) => {
  try {

    const { messageId } = req.params;
    const { emoji } = req.body;

    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const existingReaction = message.reactions.find(
      (reaction) => reaction.user.toString() === userId.toString()
    );

    if (existingReaction) {

      if (existingReaction.emoji === emoji) {

        message.reactions = message.reactions.filter(
          (reaction) => reaction.user.toString() !== userId.toString()
        );

      } else {

        existingReaction.emoji = emoji;

      }

    } else {

      message.reactions.push({
        user: userId,
        emoji,
      });

    }

    await message.save();

    const io = getIO();

    const receiverSocketId = userSocketMap[message.receiverId.toString()];
    const senderSocketId = userSocketMap[message.senderId.toString()];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("reactionUpdated", message);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("reactionUpdated", message);
    }

    res.status(200).json(message);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUsers,
  markMessagesAsSeen,
  addReaction,
};