/**
 * middleware/auth.js
 * Verifies JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */

const jwt = require("jsonwebtoken");
const { findUserById } = require("../utils/userStore");

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure user still exists in store (handles deleted accounts)
    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists." });
    }

    // Attach fresh user data (not stale JWT payload)
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      credits: user.credits,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
};
