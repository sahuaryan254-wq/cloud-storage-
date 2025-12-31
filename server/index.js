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

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   DB Connection
======================= */
sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ MySQL connected");
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");
  })
  .catch((err) => console.error("❌ DB error:", err));

/* =======================
   Middleware
======================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Uploads folder */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

/* Ngrok bypass */
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

/* =======================
   Multer Setup
======================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* =======================
   Health
======================= */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* =======================
   AUTH ROUTES
======================= */
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ success: false, message: "Missing fields" });

    let user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (user)
      return res.status(409).json({ success: false, message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    user = await User.create({
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
      data: { token, user: { id: user.id, fullName, email } },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

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
      data: { token, user: { id: user.id, fullName: user.fullName, email } },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =======================
   FILE ROUTES
======================= */
app.get("/api/files", auth, async (req, res) => {
  const files = await File.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  res.json({
    success: true,
    data: files.map((f) => ({
      ...f.get({ plain: true }),
      uploadedAt: f.createdAt,
      s3Url: `http://localhost:${PORT}/uploads/${f.filename}`,
    })),
  });
});

app.post("/api/files", auth, upload.single("file"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "No file uploaded" });

  const newFile = await File.create({
    userId: req.user.id,
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });

  res.json({
    success: true,
    data: {
      ...newFile.get({ plain: true }),
      uploadedAt: newFile.createdAt,
      s3Url: `http://localhost:${PORT}/uploads/${newFile.filename}`,
    },
  });
});

app.delete("/api/files/:id", auth, async (req, res) => {
  const file = await File.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!file)
    return res.status(404).json({ success: false, message: "File not found" });

  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

  await file.destroy();

  res.json({ success: true });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
