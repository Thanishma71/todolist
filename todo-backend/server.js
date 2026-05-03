require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());

/* ===== CONNECT MONGODB ===== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 🔍 Check existing user
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User already registered. Please login.",
      });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
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

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Wrong password",
      });
    }

    // ✅ SEND ONLY REQUIRED DATA
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

  if (!title) {
    return res.json({ message: "Task title required" });
  }

  const newTask = new Task({
    userId,
    title,
    desc,
    deadline,
    priority,
  });

  await newTask.save();

  res.json({ message: "Task added successfully" });
});

/* ===== GET TASKS ===== */
app.get("/tasks/:userId", async (req, res) => {
  const tasks = await Task.find({ userId: req.params.userId });
  res.json(tasks);
});

/* ===== DELETE TASK ===== */
app.delete("/delete-task/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

/* ===== COMPLETE TASK ===== */
app.put("/complete-task/:id", async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { completed: true });
  res.json({ message: "Task completed" });
});

/* ===== START SERVER ===== */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
