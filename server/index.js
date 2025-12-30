const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   Middlewares
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ngrok browser warning bypass (optional but useful)
app.use((req, res, next) => {
  res.setHeader("ngrok-skip-browser-warning", "true");
  next();
});

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
});

/* =========================
   Start Server
========================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
