// Import required packages
const express = require("express");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const http = require("http");
const cors = require("cors");
const {initializeSocket} = require("./socket");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/MessageRoutes");

// Create Express application
const app = express();
const server = http.createServer(app);
initializeSocket(server);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB(); 

app.use("/api/auth",authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/users",userRoutes);
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

// Read PORT from .env
const PORT = process.env.PORT || 5000;

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to the MERN Chat App Backend 🚀");
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
