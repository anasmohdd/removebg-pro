/**
 * routes/auth.js
 * Handles user registration, login, and profile fetch.
 */

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { findUser, findUserById, createUser } = require("../utils/userStore");
const authMiddleware = require("../middleware/auth");

const DEFAULT_CREDITS = parseInt(process.env.DEFAULT_CREDITS) || 5;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/** Helper: sign a JWT */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Helper: strip sensitive fields before sending user to client */
function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }

    // Check if email is already taken
    const existing = findUser("email", email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = createUser({
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      credits: DEFAULT_CREDITS,
      createdAt: new Date().toISOString(),
    });

    // Issue JWT
    const token = signToken({ id: newUser.id });

    res.status(201).json({
      message: "Account created successfully!",
      token,
      user: safeUser(newUser),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup." });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Find user
    const user = findUser("email", email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Issue JWT
    const token = signToken({ id: user.id });

    res.json({
      message: "Logged in successfully!",
      token,
      user: safeUser(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// Returns fresh user data (including updated credits) from the store.
router.get("/me", authMiddleware, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: safeUser(user) });
});

module.exports = router;
