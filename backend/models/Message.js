const mongoose = require("mongoose");
const User = require("./User");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    file:{
      type:String,
      default: "",
    },

    fileType:{
      type: String,
      default: "",
    },
    
    seen:{
      type: Boolean,
      default: false,
    },

    replyTo:{
      type: mongoose.Schema.Types.ObjectId,
      ref:"Message",
      default: null,
    },

    reactions:[
      {
        user:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"User",
        },

        emoji:{
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);