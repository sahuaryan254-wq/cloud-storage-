require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/database");

const User = require("./models/User");
const File = require("./models/File");
const auth = require("./middleware/auth");

// Connect to MySQL
sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL connected via Sequelize");
    // Sync models
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Database synced");
  })
  .catch((err) => {
    console.error("MySQL connection error:", err);
  });

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   Middlewares
========================= */
app.use(cors());
app.use(express.json());
<<<<<<< HEAD
app.use(express.urlencoded({ extended: true }));
=======
app.use("/uploads", express.static(uploadDir));
>>>>>>> 0921f9c (new files)

// ngrok browser warning bypass (optional but useful)
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

<<<<<<< HEAD
/* =========================
   Root Test Route
========================= */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* =========================
   Health Check
========================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "cloud-storage-backend",
    time: new Date().toISOString(),
  });
});

/* =========================
   GitHub Webhook Endpoint
========================= */
app.post("/github-webhook", (req, res) => {
  const event = req.headers["x-github-event"];

  console.log("✅ GitHub Webhook Received");
  console.log("Event:", event);

  // ping test from GitHub
  if (event === "ping") {
    return res.status(200).send("pong");
  }

  // push event
  if (event === "push") {
    const repo = req.body?.repository?.full_name;
    const branch = req.body?.ref;
    const commitMsg = req.body?.head_commit?.message;

    console.log("Repo:", repo);
    console.log("Branch:", branch);
    console.log("Commit:", commitMsg);

    // 👉 yahin baad me Jenkins trigger hoga
  }

  return res.status(200).json({
    success: true,
    message: "Webhook received successfully",
  });
});

/* =========================
   Mock Auth (temporary)
========================= */
const users = [];

// Signup
app.post("/api/auth/signup", (req, res) => {
  const { fullName, email, password } = req.body || {};

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  const exists = users.find((u) => u.email === email.toLowerCase());
  if (exists) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  const user = {
    id: Date.now().toString(),
    fullName: String(fullName).trim(),
    email: String(email).toLowerCase(),
  };

  users.push(user);

  return res.status(201).json({
    success: true,
    data: {
      token: "mock-token",
      user,
    },
  });
});

// Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing fields",
    });
  }

  const user = users.find((u) => u.email === String(email).toLowerCase());
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      token: "mock-token",
      user,
    },
  });
=======
// --- Auth Routes ---

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (user) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create Token
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect email or password. Please check your details." });
    }

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      data: {
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
});

const nodemailer = require("nodemailer");

// ... (existing code)

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address." });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ success: false, message: "We couldn't find an account with that email address." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // DEV MODE: Log OTP to console
    console.log("\n==================================================");
    console.log(`🔑 DEV MODE OTP for ${email}: ${otp}`);
    console.log("==================================================\n");

    // Send Email (Best Effort)
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP - Cloud Uploader",
        text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      };

      console.log("Attempting to send email from:", process.env.EMAIL_USER);
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
    } catch (emailErr) {
      console.warn("⚠️ Email failed to send (using Dev Mode):", emailErr.message);
      // Do not fail the request, proceed so user can use Console OTP
    }

    res.status(200).json({ success: true, message: "OTP generated. Check your email or server console." });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ success: false, message: "Server error occurred." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: "Please provide email, OTP, and new password." });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Verify OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: "Your password has been successfully reset." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again later." });
  }
});

app.get("/api/profile", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
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
>>>>>>> 0921f9c (new files)
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`🚀 Server running at http://localhost:${PORT}`);
=======
  console.log(`Server listening on http://localhost:${PORT}`);
>>>>>>> 0921f9c (new files)
});
