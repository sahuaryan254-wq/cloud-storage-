require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const sequelize = require("./config/database");
const User = require("./models/User");
const File = require("./models/File");
const auth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= Middleware ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadDir));

// ngrok browser warning bypass (optional but useful)
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

// --- Auth Routes ---

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists)
      return res.status(409).json({ success: false, message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hash,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      data: { token, user: { id: user.id, fullName, email: user.email } },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: { token, user: { id: user.id, fullName: user.fullName, email: user.email } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/profile/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const profileImageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

    // Update user
    user.profileImageUrl = profileImageUrl;
    await user.save();

    res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- File Routes ---

// List files (Protected)
app.get("/api/files", auth, async (req, res) => {
  try {
    // Find files belonging to the logged-in user
    const files = await File.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    const fileList = files.map((f) => {
      const plain = f.get({ plain: true });
      return {
        ...plain,
        id: plain.id.toString(), // Ensure ID is string if frontend expects it, though mysql returns number
        // uploadedAt: plain.createdAt, // Sequelize uses createdAt by default
        uploadedAt: plain.createdAt,
        s3Url: `http://localhost:${PORT}/uploads/${plain.filename}`,
      };
    });

    res.status(200).json({ success: true, data: fileList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Upload file (Protected)
app.post("/api/files", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { description } = req.body;

    // Determine Category
    let category = "OTHER";
    const mime = req.file.mimetype;
    if (mime.startsWith("image/")) category = "IMAGE";
    else if (mime === "application/pdf") category = "PDF";
    else if (
      mime === "application/msword" ||
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      category = "DOC";
    }

    const newFile = await File.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimeType: mime,
      size: req.file.size,
      category,
      description,
    });

    const plain = newFile.get({ plain: true });

    res.status(200).json({
      success: true,
      data: {
        ...plain,
        id: plain.id.toString(),
        uploadedAt: plain.createdAt,
        s3Url: `http://localhost:${PORT}/uploads/${plain.filename}`,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Delete file (Protected)
app.delete("/api/files/:id", auth, async (req, res) => {
  try {
    /*
    IMPORTANT: Frontend sends ID as a string, usually from a route param.
    Sequelize integer ID query works, but safeguard if needed.
    */
    const file = await File.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Delete physical file
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error("Failed to delete local file", e);
      }
    }

    await file.destroy();

    res.status(200).json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   Start Server
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
