const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if all fields are filled
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
           message: "User already exists",
         });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        fullName,
        email,
        password: hashedPassword,
      });

      await user.save();

      const token = jwt.sign({
      id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      } );

      return res.status(201).json({
        message: "User Registered Successfully",
        token,
        user,
      });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    const token = jwt.sign({
      id: user._id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    } );

    return res.status(200).json({
      message: "Login Successful",
      token,
      user, 
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });

  }
};

const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json(user);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });

  }
};

module.exports = {
  signup,
  login,
  getProfile,
};