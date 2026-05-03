require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());

/* ===== CONNECT MONGODB ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ===== HOME ROUTE ===== */
app.get("/", (req, res) => {
  res.send("Todo Backend API Running");
});

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already registered. Please login.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Registration successful",
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      message: "Error registering user",
    });
  }
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Wrong password",
      });
    }

    // Login success
    res.json({
      success: true,
      _id: user._id,
      username: user.username,
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      message: "Login error",
    });
  }
});

/* ===== ADD TASK ===== */
app.post("/add-task", async (req, res) => {
  const { userId, title, desc, deadline, priority } = req.body;

  try {
    if (!title) {
      return res.json({
        success: false,
        message: "Task title required",
      });
    }

    const newTask = new Task({
      userId,
      title,
      desc,
      deadline,
      priority,
    });

    await newTask.save();

    res.json({
      success: true,
      message: "Task added successfully",
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      message: "Error adding task",
    });
  }
});

/* ===== GET TASKS ===== */
app.get("/tasks/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.params.userId,
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      message: "Error fetching tasks",
    });
  }
});

/* ===== DELETE TASK ===== */
app.delete("/delete-task/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Task deleted",
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      message: "Error deleting task",
    });
  }
});

/* ===== COMPLETE TASK ===== */
app.put("/complete-task/:id", async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, {
      completed: true,
    });

    res.json({
      success: true,
      message: "Task completed",
    });
  } catch (err) {
    console.error(err);

    res.json({
      success: false,
      message: "Error completing task",
    });
  }
});

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
