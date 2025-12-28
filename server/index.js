const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, time: Date.now() });
});

// Simple in-memory user store (for mock only)
const users = [];

// Signup route (mock)
app.post("/api/auth/signup", (req, res) => {
  const { fullName, email, password } = req.body || {};
  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // check already exists
  const exists = users.find((u) => u.email === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  const user = {
    id: Date.now().toString(),
    fullName: String(fullName).trim(),
    email: String(email).toLowerCase(),
  };
  users.push(user);

  // Return a fake token and user
  return res.status(201).json({ success: true, data: { token: "mock-token", user } });
});

// Login route (mock)
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: "Missing fields" });
  const user = users.find((u) => u.email === String(email).toLowerCase());
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });
  return res.status(200).json({ success: true, data: { token: "mock-token", user } });
});

app.listen(PORT, () => {
  console.log(`Mock server listening on http://localhost:${PORT}`);
});
