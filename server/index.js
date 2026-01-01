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

/* ================= DB ================= */
sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ MySQL connected");
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");
  })
  .catch((err) => console.error("❌ DB error:", err));

/* ================= Upload folder ================= */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use("/uploads", express.static(uploadDir));

/* ================= Multer ================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ================= Health ================= */
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

/* ================= AUTH ================= */

// SIGNUP
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

/* ================= START ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
